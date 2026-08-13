#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIMULADOR DE BANCADA — Projeto Integrador · Câmara Frigorífica

Simula a câmara térmica e a lógica de controle SEM NENHUM HARDWARE.
Serve para:

  1. Ajustar os ganhos do PID antes de montar qualquer coisa
  2. Validar o modo ciclo (patamares, tempos, número de ciclos)
  3. Ver o que acontece na falha da fan, na emergência e no STOP
  4. Estimar quanto tempo o ensaio vai durar de verdade

O modelo térmico usa os mesmos números calculados no Doc 12:
UA = 0,30 W/K, capacidade térmica 600 J/K, Peltier TEC1-12706, PTC de 60 W.

    python simulador.py                      # cenário padrão (pull-down)
    python simulador.py --cenario ciclo      # ensaio de ciclagem
    python simulador.py --cenario falha-fan  # a fan do dissipador para
    python simulador.py --cenario emergencia
    python simulador.py --kp 12 --ki 0.4 --kd 2
    python simulador.py --cenario ciclo --csv ensaio.csv

Sem dependências: usa só a biblioteca padrão do Python.
"""

from __future__ import annotations

import argparse
import csv
import math
from dataclasses import dataclass, field

# ══════════════════════════════════════════════════════════════════════
#  MODELO FÍSICO DA CÂMARA
# ══════════════════════════════════════════════════════════════════════


@dataclass
class Camara:
    """Modelo térmico de primeira ordem, com Peltier e PTC reais."""

    # --- envelope térmico (Doc 12 §12.2) ---
    UA: float = 0.30           # W/K — perda pelas paredes + porta + infiltração
    C: float = 600.0           # J/K — capacidade térmica efetiva (ar + acrílico + bandeja)
    t_ambiente: float = 25.0   # °C

    # --- Peltier TEC1-12706 ---
    p_peltier: float = 144.0   # W elétricos - 2x TEC1-12706 EM SERIE a 24 V / 6 A
    qc_max: float = 57.0       # W bombeados com ΔT = 0
    dt_max: float = 66.0       # K — ΔT máximo da pastilha
    ua_dissipador: float = 4.0 # W/K — cooler de CPU saudável (~100 W / 25 K)

    # --- PTC cerâmico ---
    p_ptc: float = 60.0        # W

    # --- fans internas (o trabalho elétrico delas vira calor DENTRO) ---
    p_fans: float = 3.0        # W

    # --- estado ---
    temperatura: float = field(default=25.0)
    t_lado_quente: float = field(default=25.0)
    fan_dissipador_ok: bool = True

    def _calor_peltier(self, duty: float) -> float:
        """Calor removido da câmara (W). Resolve o acoplamento com o lado quente.

        A Peltier bombeia menos calor conforme o lado quente sobe — e o lado
        quente sobe justamente porque ela está bombeando. Resolve-se iterando.
        """
        if duty <= 0:
            self.t_lado_quente = self.t_ambiente
            return 0.0

        p_eletrica = duty * self.p_peltier
        ua_dis = self.ua_dissipador if self.fan_dissipador_ok else 0.45  # fan parada
        qc = 0.0

        for _ in range(20):                       # converge em poucas iterações
            self.t_lado_quente = self.t_ambiente + (p_eletrica + qc) / ua_dis
            dt_pastilha = self.t_lado_quente - self.temperatura
            qc_novo = duty * self.qc_max * (1.0 - dt_pastilha / self.dt_max)
            qc_novo = max(0.0, qc_novo)
            if abs(qc_novo - qc) < 0.01:
                break
            qc = qc_novo

        return qc

    def passo(self, dt: float, duty_frio: float, duty_quente: float, fans_ligadas: bool):
        """Avança a simulação em dt segundos."""
        q_frio = self._calor_peltier(duty_frio)
        q_quente = duty_quente * self.p_ptc
        q_fans = self.p_fans if fans_ligadas else 0.0
        q_perda = self.UA * (self.t_ambiente - self.temperatura)   # entra se fora > dentro

        q_liquido = q_quente + q_fans + q_perda - q_frio
        self.temperatura += (q_liquido / self.C) * dt

    @property
    def peltier_em_risco(self) -> bool:
        """A pastilha queima acima de ~90 °C no lado quente."""
        return self.t_lado_quente > 90.0


# ══════════════════════════════════════════════════════════════════════
#  CONTROLADOR — espelha o firmware do Doc 40
# ══════════════════════════════════════════════════════════════════════


@dataclass
class Receita:
    sp_frio: float = 5.0
    sp_quente: float = 40.0
    patamar_frio_s: float = 600.0
    patamar_quente_s: float = 600.0
    total_ciclos: int = 3
    tolerancia: float = 0.5


class Controlador:
    """Máquina de estados + PID bipolar + modo ciclo, iguais ao firmware."""

    BANDA_MORTA = 5.0            # % de duty
    DUTY_MAXIMO = 95.0
    INTERVALO_TROCA = 30.0       # s entre frio ↔ quente
    TIMEOUT_RAMPA = 45 * 60.0    # s
    TEMPO_PARTIDA_FAN = 5.0      # s
    RPM_MINIMA = 400

    def __init__(self, kp=8.0, ki=0.2, kd=1.0, receita: Receita | None = None):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.receita = receita or Receita()

        self.estado = "AGUARDA_START"
        self.modo = "PARADO"            # PARADO · FRIO · QUENTE
        self.modo_operacao = "MANUAL"   # MANUAL · CICLO
        self.fase = "-"
        self.ciclo_atual = 0
        self.alerta = ""

        self.setpoint = 5.0
        self.saida = 0.0
        self._integral = 0.0
        self._erro_anterior = 0.0
        self._t_ultima_troca = -1e9
        self._t_inicio_fase = 0.0
        self._t_inicio_patamar = 0.0
        self._t_inicio_frio = 0.0
        self.potencia_disponivel = True   # ← o hardware (KA1/KA2) manda aqui

    # ---------------------------------------------------------------- PID
    def _pid(self, entrada: float, dt: float) -> float:
        erro = self.setpoint - entrada
        self._integral += erro * dt
        # anti-windup: limita o termo integral à faixa de saída
        if self.ki > 0:
            limite = 100.0 / self.ki
            self._integral = max(-limite, min(limite, self._integral))
        derivada = (erro - self._erro_anterior) / dt if dt > 0 else 0.0
        self._erro_anterior = erro
        saida = self.kp * erro + self.ki * self._integral + self.kd * derivada
        return max(-100.0, min(100.0, saida))

    # ------------------------------------------------------------- eventos
    def start(self, t: float):
        if self.estado != "AGUARDA_START":
            return
        if not self.potencia_disponivel:
            self.alerta = "SEM_POTENCIA"
            return
        self.estado = "RODANDO"
        self.alerta = ""
        self._integral = 0.0
        if self.modo_operacao == "CICLO":
            self.fase = "RAMPA_FRIO"
            self.ciclo_atual = 1
            self.setpoint = self.receita.sp_frio
            self._t_inicio_fase = t

    def stop(self, _t: float):
        if self.estado == "RODANDO":
            self.estado = "AGUARDA_START"
            self.modo = "PARADO"
            self.saida = 0.0

    def emergencia(self, _t: float):
        # O hardware (KA1 perde o selo) corta a potência; o firmware só registra
        self.potencia_disponivel = False
        self.estado = "EMERGENCIA"
        self.modo = "PARADO"
        self.saida = 0.0
        self.alerta = "EMERGENCIA"

    def rearme(self, _t: float):
        """Botão azul S3: refaz o selo do KA1. NÃO reinicia o processo."""
        self.potencia_disponivel = True
        if self.estado == "EMERGENCIA":
            self.estado = "AGUARDA_START"
            self.alerta = ""

    def trip(self, motivo: str):
        self.estado = "FALHA"
        self.modo = "PARADO"
        self.saida = 0.0
        self.alerta = motivo

    # --------------------------------------------------------------- ciclo
    def _gerenciar_ciclo(self, t: float, temperatura: float):
        if self.modo_operacao != "CICLO" or self.estado != "RODANDO":
            return
        r = self.receita
        chegou = abs(temperatura - self.setpoint) <= r.tolerancia

        if self.fase in ("RAMPA_FRIO", "RAMPA_QUENTE"):
            if chegou:
                self._t_inicio_patamar = t
                self.fase = "PATAMAR_FRIO" if self.fase == "RAMPA_FRIO" else "PATAMAR_QUENTE"
            elif t - self._t_inicio_fase > self.TIMEOUT_RAMPA:
                self.trip("SETPOINT_INATINGIVEL")

        elif self.fase == "PATAMAR_FRIO":
            if t - self._t_inicio_patamar >= r.patamar_frio_s:
                self.fase = "ESPERA_Q"
                self._t_inicio_fase = t

        elif self.fase == "PATAMAR_QUENTE":
            if t - self._t_inicio_patamar >= r.patamar_quente_s:
                if r.total_ciclos > 0 and self.ciclo_atual >= r.total_ciclos:
                    self.fase = "CONCLUIDO"
                    self.estado = "AGUARDA_START"
                    self.modo = "PARADO"
                    self.alerta = "CICLO_CONCLUIDO"
                else:
                    self.ciclo_atual += 1
                    self.fase = "ESPERA_F"
                    self._t_inicio_fase = t

        elif self.fase in ("ESPERA_Q", "ESPERA_F"):
            self.modo = "PARADO"
            if t - self._t_inicio_fase >= self.INTERVALO_TROCA:
                if self.fase == "ESPERA_Q":
                    self.setpoint = r.sp_quente
                    self.fase = "RAMPA_QUENTE"
                else:
                    self.setpoint = r.sp_frio
                    self.fase = "RAMPA_FRIO"
                self._t_inicio_fase = t
                self._integral = 0.0

    # --------------------------------------------------------------- passo
    def passo(self, t: float, dt: float, temperatura: float, fan_ok: bool):
        """Devolve (duty_frio, duty_quente) em fração de 0 a 1."""
        if self.estado != "RODANDO" or not self.potencia_disponivel:
            self.modo = "PARADO"
            self.saida = 0.0
            return 0.0, 0.0

        self._gerenciar_ciclo(t, temperatura)
        if self.estado != "RODANDO":
            return 0.0, 0.0

        # Proteção da Peltier: fan do dissipador parada com o frio ativo
        if self.modo == "FRIO" and not fan_ok and t - self._t_inicio_frio > self.TEMPO_PARTIDA_FAN:
            self.trip("FAN_PARADA")
            return 0.0, 0.0

        if self.fase in ("ESPERA_Q", "ESPERA_F"):
            return 0.0, 0.0

        self.saida = self._pid(temperatura, dt)

        # seleção de modo com banda morta e intervalo de troca
        if self.saida > self.BANDA_MORTA:
            alvo = "QUENTE"
        elif self.saida < -self.BANDA_MORTA:
            alvo = "FRIO"
        else:
            alvo = "PARADO"

        if alvo != self.modo and alvo != "PARADO" and self.modo != "PARADO":
            if t - self._t_ultima_troca < self.INTERVALO_TROCA:
                self.modo = "PARADO"
                return 0.0, 0.0
        if alvo != self.modo:
            self._t_ultima_troca = t
            if alvo == "FRIO":
                self._t_inicio_frio = t
        self.modo = alvo

        duty = min(abs(self.saida), self.DUTY_MAXIMO) / 100.0
        if self.modo == "FRIO":
            return duty, 0.0
        if self.modo == "QUENTE":
            return 0.0, duty
        return 0.0, 0.0


# ══════════════════════════════════════════════════════════════════════
#  CENÁRIOS
# ══════════════════════════════════════════════════════════════════════

CENARIOS = {
    "pulldown": {
        "descricao": "Resfriamento a partir do ambiente até 5 °C (curva de pull-down)",
        "duracao": 60 * 60,
        "modo": "MANUAL",
        "setpoint": 5.0,
        "eventos": [(5, "start")],
    },
    "degrau": {
        "descricao": "Estabiliza em 15 °C e depois pede 5 °C (resposta ao degrau)",
        "duracao": 90 * 60,
        "modo": "MANUAL",
        "setpoint": 15.0,
        "eventos": [(5, "start"), (35 * 60, "setpoint:5")],
    },
    "ciclo": {
        "descricao": "Ensaio de ciclagem térmica: 5 °C ↔ 40 °C, 2 ciclos, patamares de 5 min",
        "duracao": 150 * 60,
        "modo": "CICLO",
        "setpoint": 5.0,
        "receita": Receita(5.0, 40.0, 5 * 60, 5 * 60, 2, 0.5),
        "eventos": [(5, "start")],
    },
    "falha-fan": {
        "descricao": "A fan do dissipador para aos 15 min — a proteção deve atuar",
        "duracao": 40 * 60,
        "modo": "MANUAL",
        "setpoint": 5.0,
        "eventos": [(5, "start"), (15 * 60, "fan-parada")],
    },
    "emergencia": {
        "descricao": "Emergência aos 20 min · destrava aos 25 · REARME aos 30 · START aos 35",
        "duracao": 60 * 60,
        "modo": "MANUAL",
        "setpoint": 5.0,
        "eventos": [
            (5, "start"),
            (20 * 60, "emergencia"),
            (25 * 60, "destrava"),
            (30 * 60, "rearme"),
            (35 * 60, "start"),
        ],
    },
    "stop": {
        "descricao": "STOP aos 20 min e novo START aos 30 (sem precisar de rearme)",
        "duracao": 60 * 60,
        "modo": "MANUAL",
        "setpoint": 5.0,
        "eventos": [(5, "start"), (20 * 60, "stop"), (30 * 60, "start")],
    },
}


# ══════════════════════════════════════════════════════════════════════
#  SAÍDA
# ══════════════════════════════════════════════════════════════════════


def grafico_ascii(amostras, largura=104, altura=22):
    """Desenha temperatura × tempo em texto, com o setpoint tracejado."""
    if not amostras:
        return ""
    temps = [a["temp"] for a in amostras]
    sps = [a["sp"] for a in amostras if a["ativo"]]
    t_min = min(min(temps), min(sps) if sps else min(temps)) - 2
    t_max = max(max(temps), max(sps) if sps else max(temps)) + 2
    faixa = max(t_max - t_min, 1e-6)

    tela = [[" "] * largura for _ in range(altura)]
    passo = max(1, len(amostras) // largura)

    for col in range(largura):
        i = min(col * passo, len(amostras) - 1)
        a = amostras[i]
        lin_t = int((t_max - a["temp"]) / faixa * (altura - 1))
        lin_t = max(0, min(altura - 1, lin_t))
        if a["ativo"]:
            lin_sp = int((t_max - a["sp"]) / faixa * (altura - 1))
            lin_sp = max(0, min(altura - 1, lin_sp))
            if tela[lin_sp][col] == " ":
                tela[lin_sp][col] = "·"
        simbolo = {"FRIO": "o", "QUENTE": "^"}.get(a["modo"], "-")
        tela[lin_t][col] = simbolo

    linhas = []
    for n, linha in enumerate(tela):
        valor = t_max - (n / (altura - 1)) * faixa
        linhas.append(f"{valor:6.1f} │{''.join(linha)}")
    linhas.append("       └" + "─" * largura)
    dur_min = amostras[-1]["t"] / 60
    rot = f"       0 min{' ' * (largura - 22)}{dur_min:.0f} min"
    linhas.append(rot)
    return "\n".join(linhas)


def metricas(amostras, setpoint_final):
    """Extrai os números que vão para o relatório."""
    ativos = [a for a in amostras if a["ativo"]]
    if not ativos:
        return {}
    t0 = ativos[0]["t"]
    dentro = [a for a in ativos if abs(a["temp"] - a["sp"]) <= 0.5]
    t_chegada = (dentro[0]["t"] - t0) if dentro else None

    ultimos = ativos[-int(len(ativos) * 0.2) :] or ativos
    erro_regime = sum(abs(a["temp"] - a["sp"]) for a in ultimos) / len(ultimos)

    # overshoot: quanto passou do setpoint na direção do movimento
    overshoot = 0.0
    for a in ativos:
        if a["sp"] < ativos[0]["temp"]:          # estava descendo
            overshoot = max(overshoot, a["sp"] - a["temp"])
        else:
            overshoot = max(overshoot, a["temp"] - a["sp"])

    duty_medio = sum(a["duty"] for a in ativos) / len(ativos)
    return {
        "t_chegada": t_chegada,
        "erro_regime": erro_regime,
        "overshoot": max(0.0, overshoot),
        "duty_medio": duty_medio,
        "temp_min": min(a["temp"] for a in amostras),
        "temp_max": max(a["temp"] for a in amostras),
    }


# ══════════════════════════════════════════════════════════════════════
#  LAÇO PRINCIPAL
# ══════════════════════════════════════════════════════════════════════


def simular(cenario: dict, kp: float, ki: float, kd: float, dt: float = 1.0):
    camara = Camara()
    ctrl = Controlador(kp, ki, kd, cenario.get("receita"))
    ctrl.modo_operacao = cenario["modo"]
    ctrl.setpoint = cenario["setpoint"]

    eventos = sorted(cenario["eventos"])
    fan_ok = True
    amostras = []
    registro_eventos = []
    t = 0.0
    idx = 0

    while t < cenario["duracao"]:
        while idx < len(eventos) and eventos[idx][0] <= t:
            _, ev = eventos[idx]
            if ev == "start":
                ctrl.start(t)
            elif ev == "stop":
                ctrl.stop(t)
            elif ev == "emergencia":
                ctrl.emergencia(t)
            elif ev == "destrava":
                pass                       # o cogumelo destrava, mas o selo NÃO volta
            elif ev == "rearme":
                ctrl.rearme(t)
            elif ev == "fan-parada":
                fan_ok = False
                camara.fan_dissipador_ok = False
            elif ev.startswith("setpoint:"):
                ctrl.setpoint = float(ev.split(":")[1])
                ctrl._integral = 0.0
            registro_eventos.append((t, ev, ctrl.estado, camara.temperatura))
            idx += 1

        alerta_antes = ctrl.alerta
        duty_f, duty_q = ctrl.passo(t, dt, camara.temperatura, fan_ok)
        if ctrl.alerta != alerta_antes and ctrl.alerta:
            registro_eventos.append((t, f"⚠ {ctrl.alerta}", ctrl.estado, camara.temperatura))

        camara.passo(dt, duty_f, duty_q, fans_ligadas=(duty_f > 0 or duty_q > 0))

        amostras.append({
            "t": t,
            "temp": camara.temperatura,
            "t_quente": camara.t_lado_quente,
            "sp": ctrl.setpoint,
            "modo": ctrl.modo,
            "estado": ctrl.estado,
            "fase": ctrl.fase,
            "ciclo": ctrl.ciclo_atual,
            "duty": (duty_f + duty_q) * 100,
            "ativo": ctrl.estado == "RODANDO",
            "alerta": ctrl.alerta,
        })
        t += dt

    return camara, ctrl, amostras, registro_eventos


def main():
    ap = argparse.ArgumentParser(description="Simulador da câmara térmica")
    ap.add_argument("--cenario", default="pulldown", choices=sorted(CENARIOS))
    ap.add_argument("--kp", type=float, default=8.0)
    ap.add_argument("--ki", type=float, default=0.2)
    ap.add_argument("--kd", type=float, default=1.0)
    ap.add_argument("--ambiente", type=float, default=25.0, help="temperatura ambiente °C")
    ap.add_argument("--csv", help="grava a série completa num arquivo CSV")
    args = ap.parse_args()

    cen = CENARIOS[args.cenario]
    Camara.t_ambiente = args.ambiente
    camara, ctrl, amostras, eventos = simular(cen, args.kp, args.ki, args.kd)

    print()
    print("═" * 112)
    print(f"  CENÁRIO: {args.cenario.upper()}  —  {cen['descricao']}")
    print(f"  PID: Kp={args.kp}  Ki={args.ki}  Kd={args.kd}   ·   Ambiente: {args.ambiente} °C")
    print("═" * 112)
    print()
    print(grafico_ascii(amostras))
    print()
    print("  Legenda:  o = resfriando   ^ = aquecendo   - = parado   · = setpoint")
    print()

    print("─" * 112)
    print("  LINHA DO TEMPO")
    print("─" * 112)
    for t, ev, estado, temp in eventos:
        print(f"   {int(t)//60:>3d}:{int(t)%60:02d}   {ev:<24s} → estado {estado:<14s} temp {temp:5.1f} °C")

    m = metricas(amostras, ctrl.setpoint)
    if m:
        print()
        print("─" * 112)
        print("  MÉTRICAS")
        print("─" * 112)
        if m["t_chegada"] is not None:
            print(f"   Tempo até atingir o setpoint (±0,5 °C) : {m['t_chegada']/60:.1f} min")
        else:
            print(f"   Tempo até atingir o setpoint           : NÃO ATINGIU")
        print(f"   Erro em regime permanente              : {m['erro_regime']:.2f} °C")
        print(f"   Sobressinal (overshoot)                : {m['overshoot']:.2f} °C")
        print(f"   Duty médio                             : {m['duty_medio']:.1f} %")
        print(f"   Temperatura mínima alcançada           : {m['temp_min']:.1f} °C")
        print(f"   Temperatura máxima alcançada           : {m['temp_max']:.1f} °C")
        print(f"   Lado quente da Peltier no fim          : {camara.t_lado_quente:.1f} °C")
        if camara.peltier_em_risco:
            print("   ⚠  LADO QUENTE ACIMA DE 90 °C — a pastilha queimaria aqui")

        # confere a carga térmica calculada no Doc 12
        carga = m["duty_medio"] / 100 * 144 * 0.40
        print()
        print(f"   Carga térmica implícita no duty médio  : ≈ {carga:.1f} W")
        print(f"   (o Doc 12 calculou 9,5 W — se bater, o dimensionamento está certo)")

    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(amostras[0].keys()))
            w.writeheader()
            w.writerows(amostras)
        print(f"\n   CSV gravado: {args.csv}  ({len(amostras)} linhas)")

    print()


if __name__ == "__main__":
    main()
