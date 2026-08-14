import sys
import json
import subprocess
import colorsys
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from pathlib import Path

# Importa as inteligências do analisador CLI
try:
    from analisar_cad import parse_cad, detectar_nets, parse_cad_wire_networks
except ImportError:
    messagebox.showerror("Erro fatal", "Arquivo analisar_cad.py não encontrado na mesma pasta!")
    sys.exit(1)

# ============================================================================
# MOTOR DO ALGORITMO VISUAL (ROTEADOR INTELIGENTE)
# ============================================================================
CUSTO_MUDAR_ZONA = 50
CUSTO_FIO_EXTRA = 1000

PRIORIDADE_CATEGORIA = [
    "contator_pot", "disjuntor", "rele_termico", "trafo",
    "fonte_dc", "entrada", "motor", "fusivel",
    "bobina", "rt_aux", "contato_aux", "timer_aux",
    "botao", "seletor", "sinaleiro", "rele_logico",
    "gerador", "tomada", "sensor", "outro",
]

# (zona_alvo, linha_ancora, prioridade_ordem)
REGRAS_PLACEMENT = {
    "entrada":      ("interno", 0,  1),
    "disjuntor":    ("interno", 0,  2),
    "rele_termico": ("interno", 0,  3),
    "fusivel":      ("interno", 0,  4),
    "trafo":        ("interno", 0,  5),
    "fonte_dc":     ("interno", 0,  6),
    "contator_pot": ("interno", 1, 10),
    "rele_logico":  ("interno", 2, 11),
    "rt_aux":       ("interno", 2, 12),
    "contato_aux":  ("interno", 2, 13),
    "timer_aux":    ("interno", 2, 14),
    "bobina":       ("interno", 3, 15),
    "sensor":       ("interno", 2, 16),
    "gerador":      ("interno", 1, 17),
    "botao":        ("tampa",   0, 20),
    "seletor":      ("tampa",   0, 21),
    "sinaleiro":    ("tampa",   1, 22),
    "tomada":       ("tampa",   2, 23),
    "motor":        ("externo", 0, 30),
    "outro":        ("interno", 3, 99),
}

_BASE_CORES = [
    "#00e6b8", "#e63366", "#e6e600", "#e67a00",
    "#9933cc", "#0099cc", "#cc6666", "#66cc66",
    "#6666cc", "#cc66cc", "#cccc66", "#66cccc",
]
_EXTRA_HUES   = [0, 210, 120, 40, 280, 170]   # red, blue, green, orange, purple, teal
_EXTRA_LEVELS = [(0.50, 0.95), (0.85, 0.65), (1.00, 0.40)]  # (sat, val) light→dark

def gerar_cor_net(idx):
    if idx < len(_BASE_CORES):
        return _BASE_CORES[idx]
    extra = idx - len(_BASE_CORES)
    hue_deg = _EXTRA_HUES[extra % len(_EXTRA_HUES)]
    s, v = _EXTRA_LEVELS[(extra // len(_EXTRA_HUES)) % len(_EXTRA_LEVELS)]
    r, g, b = colorsys.hsv_to_rgb(hue_deg / 360, s, v)
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"


def emparelhar_terminais(terminais):
    """Pareia terminais como (TOP, BOT) seguindo convenção elétrica:
       - Sufixo X1↔X2: A1/A2, U1/U2, V1/V2, W1/W2 (TOP=…1, BOT=…2)
       - Numeração ímpar↔par: 1↔2, 3↔4, 5↔6, 11↔12, 13↔14, 95↔96 (TOP=ímpar, BOT=par)
       - Sem par: vai sozinho como TOP (PE, N, etc.)
       Retorna lista [(top_or_None, bot_or_None), ...] preservando ordem de entrada.
    """
    usado = set()
    colunas = []
    for t in terminais:
        if t in usado:
            continue
        partner = None
        # Sufixo X1↔X2 (X = letras)
        if len(t) >= 2 and t[-1] == '1' and t[:-1].isalpha():
            cand = t[:-1] + '2'
            if cand in terminais and cand not in usado:
                partner = cand
        elif t.isdigit():
            num = int(t)
            if num % 2 == 1:
                cand = str(num + 1)
                if cand in terminais and cand not in usado:
                    partner = cand
            else:
                # Par sem ímpar correspondente: tenta achar ímpar (num-1)
                cand = str(num - 1)
                if cand in terminais and cand not in usado:
                    colunas.append((cand, t))
                    usado.add(cand)
                    usado.add(t)
                    continue
        if partner:
            colunas.append((t, partner))
            usado.add(t)
            usado.add(partner)
        else:
            # Solo: vai como TOP por padrão
            colunas.append((t, None))
            usado.add(t)
    return colunas

class RoteadorInteligenteVisual:
    def __init__(self, componentes, info_terminais, grid_config):
        self.componentes = componentes
        self.info_terminais = info_terminais
        self.grid_config = grid_config

    def _calcular_custo(self, u, v, graus):
        info_u = self.info_terminais[u]
        info_v = self.info_terminais[v]

        z_u, l_u, c_u = info_u['zona'], info_u['linha'], info_u['coluna']
        z_v, l_v, c_v = info_v['zona'], info_v['linha'], info_v['coluna']

        def dist_mesma_zona(zona, l1, c1, l2, c2):
            if l1 == l2:
                return abs(c1 - c2) * 10
            else:
                max_col = self.grid_config[zona]['colunas'] - 1
                if zona == 'interno':
                    dist_esq = (c1 * 10) + abs(l1 - l2) * 10 + (c2 * 10)
                    dist_dir = ((max_col - c1) * 10) + abs(l1 - l2) * 10 + ((max_col - c2) * 10)
                    return min(dist_esq, dist_dir)
                else:
                    return (c1 * 10) + abs(l1 - l2) * 10 + (c2 * 10)

        if z_u != z_v:
            if z_u == 'externo' or z_v == 'externo':
                custo = abs(l_u - l_v) * 30 + abs(c_u - c_v) * 10 + CUSTO_MUDAR_ZONA * 2
            else:
                l_int_max = self.grid_config['interno']['linhas'] - 1
                c_int_max = self.grid_config['interno']['colunas'] - 1
                l_tmp_max = self.grid_config['tampa']['linhas'] - 1

                if z_u == 'interno':
                    dist_u = dist_mesma_zona('interno', l_u, c_u, l_int_max, c_int_max)
                    dist_v = dist_mesma_zona('tampa', l_v, c_v, l_tmp_max, 0)
                else:
                    dist_u = dist_mesma_zona('tampa', l_u, c_u, l_tmp_max, 0)
                    dist_v = dist_mesma_zona('interno', l_v, c_v, l_int_max, c_int_max)

                custo = dist_u + dist_v + CUSTO_MUDAR_ZONA
        else:
            custo = dist_mesma_zona(z_u, l_u, c_u, l_v, c_v)

        if graus[u] >= 2: custo += CUSTO_FIO_EXTRA * graus[u]
        if graus[v] >= 2: custo += CUSTO_FIO_EXTRA * graus[v]

        return custo

    def rotear(self, terminais_net, origem_forcada=None):
        if len(terminais_net) < 2: return [], 0
        melhor_rota_global = []
        melhor_custo_global = float('inf')
        inicios = [origem_forcada] if origem_forcada and origem_forcada in terminais_net else terminais_net

        for inicio in inicios:
            conectados = {inicio}
            desconectados = set(terminais_net) - {inicio}
            graus = {t: 0 for t in terminais_net}
            rota = []
            custo_total = 0
            impossivel = False

            while desconectados:
                melhor_aresta = None
                menor_custo_aresta = float('inf')

                for u in conectados:
                    if graus[u] >= self.info_terminais[u]['limite']: continue
                    for v in desconectados:
                        if graus[v] >= self.info_terminais[v]['limite']: continue
                        custo = self._calcular_custo(u, v, graus)
                        if custo < menor_custo_aresta:
                            menor_custo_aresta = custo
                            melhor_aresta = (u, v)

                if melhor_aresta is None:
                    impossivel = True
                    break

                u, v = melhor_aresta
                rota.append((u, v))
                custo_total += menor_custo_aresta
                graus[u] += 1
                graus[v] += 1
                conectados.add(v)
                desconectados.remove(v)

            if not impossivel and custo_total < melhor_custo_global:
                melhor_custo_global = custo_total
                melhor_rota_global = list(rota)

        return melhor_rota_global, melhor_custo_global

# ============================================================================
# JANELA DE COMPONENTES
# ============================================================================
class ComponentEditor(tk.Toplevel):
    def __init__(self, parent, comp_nome, comp_data, on_save_callback, on_delete_callback=None, grid_cfg=None):
        super().__init__(parent)
        self.title(f"Editar Componente: {comp_nome}" if comp_nome else "Novo Componente")
        self.geometry("400x550")
        self.transient(parent)
        self.grab_set()
        
        self.on_save_callback = on_save_callback
        self.on_delete_callback = on_delete_callback
        self.grid_cfg = grid_cfg
        self.comp_nome_original = comp_nome
        self.terminais = dict(comp_data.get("terminais", {}))
        
        frame = ttk.Frame(self, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Nome do Componente:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.e_nome = ttk.Entry(frame)
        self.e_nome.grid(row=0, column=1, sticky=tk.EW, pady=2)
        if comp_nome: self.e_nome.insert(0, comp_nome)
            
        ttk.Label(frame, text="Zona:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.cb_zona = ttk.Combobox(frame, values=["interno", "tampa", "externo"], state="readonly")
        self.cb_zona.grid(row=1, column=1, sticky=tk.EW, pady=2)
        self.cb_zona.set(comp_data.get("zona", "interno"))
        
        ttk.Label(frame, text="Linha:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.e_linha = ttk.Entry(frame)
        self.e_linha.grid(row=2, column=1, sticky=tk.EW, pady=2)
        self.e_linha.insert(0, str(comp_data.get("linha", 0)))
        
        ttk.Label(frame, text="Coluna:").grid(row=3, column=0, sticky=tk.W, pady=2)
        self.e_coluna = ttk.Entry(frame)
        self.e_coluna.grid(row=3, column=1, sticky=tk.EW, pady=2)
        self.e_coluna.insert(0, str(comp_data.get("coluna", 0)))
        
        ttk.Separator(frame, orient=tk.HORIZONTAL).grid(row=4, column=0, columnspan=2, sticky=tk.EW, pady=10)
        ttk.Label(frame, text="Terminais:").grid(row=5, column=0, sticky=tk.W, pady=2)
        
        term_frame = ttk.Frame(frame)
        term_frame.grid(row=6, column=0, columnspan=2, sticky=tk.EW, pady=2)
        
        self.list_term = tk.Listbox(term_frame, height=8)
        self.list_term.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self._atualizar_lista_terminais()
        
        add_term_frame = ttk.Frame(frame)
        add_term_frame.grid(row=7, column=0, columnspan=2, sticky=tk.EW, pady=5)
        
        ttk.Label(add_term_frame, text="Nome:").pack(side=tk.LEFT, padx=2)
        self.e_term_nome = ttk.Entry(add_term_frame, width=8)
        self.e_term_nome.pack(side=tk.LEFT, padx=2)
        
        ttk.Label(add_term_frame, text="Limite (vz=inf):").pack(side=tk.LEFT, padx=2)
        self.e_term_limite = ttk.Entry(add_term_frame, width=5)
        self.e_term_limite.pack(side=tk.LEFT, padx=2)
        
        ttk.Button(add_term_frame, text="Add", command=self.add_terminal).pack(side=tk.LEFT, padx=5)
        ttk.Button(frame, text="Remover Selecionado", command=self.remover_terminal).grid(row=8, column=0, columnspan=2, pady=2)
        
        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=9, column=0, columnspan=2, pady=15)
        ttk.Button(btn_frame, text="Salvar", command=self.salvar).pack(side=tk.LEFT, padx=5)
        if self.comp_nome_original: ttk.Button(btn_frame, text="Excluir", command=self.excluir).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancelar", command=self.destroy).pack(side=tk.LEFT, padx=5)

    def _atualizar_lista_terminais(self):
        self.list_term.delete(0, tk.END)
        for t_nome, limite in self.terminais.items():
            l_str = "∞" if limite == 99 else str(limite)
            self.list_term.insert(tk.END, f"{t_nome} (Limite: {l_str})")

    def add_terminal(self):
        t_nome = self.e_term_nome.get().strip().upper()
        l_str = self.e_term_limite.get().strip()
        if not t_nome: return
        limite = int(l_str) if l_str.isdigit() else 99
        self.terminais[t_nome] = limite
        self.e_term_nome.delete(0, tk.END)
        self.e_term_limite.delete(0, tk.END)
        self._atualizar_lista_terminais()

    def remover_terminal(self):
        sel = self.list_term.curselection()
        if not sel: return
        t_nome = self.list_term.get(sel[0]).split(" ")[0]
        if t_nome in self.terminais: del self.terminais[t_nome]
        self._atualizar_lista_terminais()

    def salvar(self):
        nome = self.e_nome.get().strip().upper()
        if not nome: return
        zona = self.cb_zona.get()
        try:
            linha = max(0, min(int(self.e_linha.get().strip()), self.grid_cfg[zona]["linhas"] - 1))
            coluna = max(0, min(int(self.e_coluna.get().strip()), self.grid_cfg[zona]["colunas"] - 1))
        except ValueError: return
            
        data = {"zona": zona, "linha": linha, "coluna": coluna, "terminais": self.terminais}
        self.on_save_callback(self.comp_nome_original, nome, data)
        self.destroy()

    def excluir(self):
        if self.on_delete_callback: self.on_delete_callback(self.comp_nome_original)
        self.destroy()

# ============================================================================
# APP PRINCIPAL (O UNIFICADOR)
# ============================================================================
class SimuladorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Painel Master: Analisador CAD + Roteador")
        self.root.geometry("1500x850")
        
        self.base_dir = Path.cwd()
        self.cads_abertos = []
        self.grid_config = {
            "interno": {"linhas": 4, "colunas": 6},
            "tampa":   {"linhas": 4, "colunas": 4},
            "externo": {"linhas": 1, "colunas": 3},
        }
        self.componentes = {} 
        self.nets = []
        self.net_selecionada_idx = -1
        self.rota_atual = []
        self.drag_data = {"item": None, "comp_nome": None, "start_x": 0, "start_y": 0}
        self._headless = False

        self.setup_ui()
        self.desenhar_painel()

    def setup_ui(self):
        style = ttk.Style()
        if "clam" in style.theme_names(): style.theme_use('clam')
            
        menu_bar = tk.Menu(self.root)
        self.root.config(menu=menu_bar)
        
        arquivo_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="Arquivo", menu=arquivo_menu)
        arquivo_menu.add_command(label="Abrir CAD(s)...", command=self.abrir_cads)
        arquivo_menu.add_separator()
        arquivo_menu.add_command(label="Salvar Painel (JSON)", command=self.salvar_projeto)
        arquivo_menu.add_command(label="Carregar Painel (JSON)", command=self.carregar_projeto)
        arquivo_menu.add_separator()
        arquivo_menu.add_command(label="Exportar Redes de Debug (.txt)", command=self.exportar_redes_debug)
        
        self.frame_esq = ttk.Frame(self.root, width=400, padding=10)
        self.frame_esq.pack(side=tk.LEFT, fill=tk.Y)
        
        # Grid Setup
        lf_grid = ttk.LabelFrame(self.frame_esq, text="Dimensões do Painel", padding=5)
        lf_grid.pack(fill=tk.X, pady=(0,5))
        f_int = ttk.Frame(lf_grid); f_int.pack(fill=tk.X)
        ttk.Label(f_int, text="Interno (LxC): ").pack(side=tk.LEFT)
        self.e_int_l = ttk.Entry(f_int, width=3); self.e_int_l.pack(side=tk.LEFT); self.e_int_l.insert(0, "4")
        self.e_int_c = ttk.Entry(f_int, width=3); self.e_int_c.pack(side=tk.LEFT); self.e_int_c.insert(0, "6")
        
        f_tmp = ttk.Frame(lf_grid); f_tmp.pack(fill=tk.X, pady=2)
        ttk.Label(f_tmp, text="Tampa (LxC): ").pack(side=tk.LEFT)
        self.e_tmp_l = ttk.Entry(f_tmp, width=3); self.e_tmp_l.pack(side=tk.LEFT); self.e_tmp_l.insert(0, "4")
        self.e_tmp_c = ttk.Entry(f_tmp, width=3); self.e_tmp_c.pack(side=tk.LEFT); self.e_tmp_c.insert(0, "4")
        ttk.Button(lf_grid, text="Aplicar Grade", command=self.atualizar_grid).pack(fill=tk.X)

        # Components
        lf_comp = ttk.LabelFrame(self.frame_esq, text="Componentes", padding=5)
        lf_comp.pack(fill=tk.X, pady=5)
        ttk.Button(lf_comp, text="+ Criar Manual", command=self.novo_componente).pack(fill=tk.X)
        ttk.Button(lf_comp, text="Auto-Posicionar do CAD", command=self.auto_posicionar_componentes).pack(fill=tk.X, pady=2)
        ttk.Button(lf_comp, text="Extrair Redes Nativas (CAD)", command=self.detectar_redes_cad).pack(fill=tk.X, pady=2)
        
        # Nets
        lf_net = ttk.LabelFrame(self.frame_esq, text="Redes (Mesmo Potencial)", padding=5)
        lf_net.pack(fill=tk.BOTH, expand=True, pady=5)

        btn_frame_net = ttk.Frame(lf_net); btn_frame_net.pack(fill=tk.X)
        ttk.Button(btn_frame_net, text="Nova", command=self.nova_net).pack(side=tk.LEFT, expand=True, fill=tk.X)
        ttk.Button(btn_frame_net, text="Excluir", command=self.excluir_net).pack(side=tk.LEFT, expand=True, fill=tk.X)

        self.list_nets = tk.Listbox(lf_net, height=4, exportselection=False)
        self.list_nets.pack(fill=tk.BOTH, expand=True, pady=2)
        self.list_nets.bind('<<ListboxSelect>>', self.on_net_select)

        # Adicionar componentes/terminais na rede
        add_comp_net_frame = ttk.Frame(lf_net)
        add_comp_net_frame.pack(fill=tk.X, pady=1)
        self.cb_comp_disp = ttk.Combobox(add_comp_net_frame, state="readonly", width=10)
        self.cb_comp_disp.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0,2))
        ttk.Button(add_comp_net_frame, text="+ Componente", command=self.add_comp_na_net).pack(side=tk.RIGHT)

        add_term_net_frame = ttk.Frame(lf_net)
        add_term_net_frame.pack(fill=tk.X, pady=1)
        self.cb_term_disp = ttk.Combobox(add_term_net_frame, state="readonly", width=10)
        self.cb_term_disp.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0,2))
        ttk.Button(add_term_net_frame, text="+ Terminal", command=self.add_term_na_net).pack(side=tk.RIGHT)

        self.list_term_net = tk.Listbox(lf_net, height=3, selectmode=tk.EXTENDED)
        self.list_term_net.pack(fill=tk.BOTH, expand=True, pady=2)
        ttk.Button(lf_net, text="Remover Selecionados", command=self.remover_term_da_net).pack(fill=tk.X)        

        # Ponto de Partida
        ttk.Label(lf_net, text="Ponto de Partida (Deixe em branco p/ IA decidir):").pack(anchor=tk.W, pady=(5,0))
        self.cb_origem_net = ttk.Combobox(lf_net, state="readonly")
        self.cb_origem_net.pack(fill=tk.X)
        self.cb_origem_net.bind("<<ComboboxSelected>>", self.on_origem_select)

        # Actions
        ttk.Button(self.frame_esq, text="1. TESTAR ROTEAMENTO VISUAL", command=self.gerar_rotas_todas).pack(fill=tk.X, pady=5)
        ttk.Button(self.frame_esq, text="2. GERAR SAÍDAS OFICIAIS (PDF/HTML)", command=self.gerar_saidas_oficiais).pack(fill=tk.X, pady=5)
        
        # Log
        self.log_text = tk.Text(self.frame_esq, height=8, state=tk.DISABLED, bg="#1e1e1e", fg="#00ff00", font=("Consolas", 8))
        self.log_text.pack(fill=tk.BOTH, expand=True)

        # Canvas
        self.frame_dir = ttk.Frame(self.root)
        self.frame_dir.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        self.canvas = tk.Canvas(self.frame_dir, bg="#202020")
        self.canvas.pack(fill=tk.BOTH, expand=True)
        self.canvas.bind("<ButtonPress-1>", self.on_drag_start)
        self.canvas.bind("<B1-Motion>", self.on_drag_motion)
        self.canvas.bind("<ButtonRelease-1>", self.on_drag_release)
        self.canvas.bind("<Double-Button-1>", self.on_double_click)

    def print_log(self, texto):
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, texto + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

    def abrir_cads(self):
        paths = filedialog.askopenfilenames(title="Abrir CADe_SIMU (.cad)", filetypes=[("CAD", "*.cad"), ("Todos", "*.*")])
        if not paths: return
        
        self.cads_abertos = list(paths)
        cad_p = Path(paths[0])
        proj_folder_tk = cad_p.parent / cad_p.stem
        proj_folder_tk.mkdir(parents=True, exist_ok=True)
        self.base_dir = proj_folder_tk
        self.print_log(f"Carregando {len(paths)} arquivo(s)...")
        
        todos_componentes = {}
        for cad_path in paths:
            try:
                # Usa parse_cad do analisar_cad.py (que agora lê latin-1)
                comps_cad = parse_cad(cad_path)
                for comp in comps_cad:
                    if comp.get('tipo') != 'wire':
                        nome = comp.get('nome', '').strip() or f"{comp.get('codigo','?')}_{comp.get('id','')}"
                        terminais = comp.get('terminais', [])

                        if nome in todos_componentes:
                            existente = todos_componentes[nome]
                            cat_nova = comp.get('tipo', 'outro') or 'outro'
                            cat_atual = existente.get('categoria', 'outro')
                            prio_nova = PRIORIDADE_CATEGORIA.index(cat_nova) if cat_nova in PRIORIDADE_CATEGORIA else len(PRIORIDADE_CATEGORIA)
                            prio_atual = PRIORIDADE_CATEGORIA.index(cat_atual) if cat_atual in PRIORIDADE_CATEGORIA else len(PRIORIDADE_CATEGORIA)
                            if prio_nova < prio_atual:
                                existente['categoria'] = cat_nova
                            for term in terminais:
                                if term not in existente['terminais']:
                                    if nome.startswith('T'):
                                        limite = 1
                                    elif nome.startswith('K') or nome.startswith('DJ'):
                                        limite = 3
                                    else:
                                        limite = 99
                                    existente['terminais'][term] = limite
                            if existente.get('x', 0) == 0:
                                existente['x'] = comp.get('x', 0)
                            if existente.get('y', 0) == 0:
                                existente['y'] = comp.get('y', 0)
                            continue

                        # Logica de limites de fio por borne
                        tdict = {}
                        for term in terminais:
                            if nome.startswith('T'):
                                limite = 1
                            elif nome.startswith('K') or nome.startswith('DJ'):
                                limite = 3
                            else:
                                limite = 99
                            tdict[term] = limite

                        todos_componentes[nome] = {
                            'zona': 'interno', 'linha': 0, 'coluna': 0,
                            'terminais': tdict, 'codigo': comp.get('codigo', 'outro'),
                            'categoria': comp.get('tipo', 'outro') or 'outro',
                            'x': comp.get('x', 0), 'y': comp.get('y', 0)
                        }
                self.print_log(f"✓ {Path(cad_path).name} carregado.")
            except Exception as e:
                self.print_log(f"✗ Erro ao ler {Path(cad_path).name}: {e}")
                
        self.componentes = todos_componentes
        self.atualizar_cb_terminais()
        self.detectar_redes_cad()
        self.desenhar_painel()

    def auto_posicionar_componentes(self):
        if not self.componentes: return

        ocupado = {z: set() for z in self.grid_config}

        def proxima_celula_livre(zona, linha_ancora):
            cfg = self.grid_config.get(zona)
            if not cfg:
                return None, None
            max_l, max_c = cfg['linhas'], cfg['colunas']
            for l in range(linha_ancora, max_l):
                for c in range(max_c):
                    if (l, c) not in ocupado[zona]:
                        return l, c
            for l in range(linha_ancora):
                for c in range(max_c):
                    if (l, c) not in ocupado[zona]:
                        return l, c
            return None, None

        def sort_key(item):
            cat = item[1].get('categoria', 'outro')
            regra = REGRAS_PLACEMENT.get(cat, ("interno", 3, 99))
            return regra[2]

        for _, info in sorted(self.componentes.items(), key=sort_key):
            cat = info.get('categoria', 'outro')
            zona_alvo, linha_ancora, _ = REGRAS_PLACEMENT.get(cat, ("interno", 3, 99))

            if zona_alvo not in self.grid_config:
                zona_alvo, linha_ancora = "interno", 3

            l, c = proxima_celula_livre(zona_alvo, linha_ancora)
            if l is None:
                zona_alvo = "interno"
                l, c = proxima_celula_livre("interno", 3)
            if l is None:
                l, c = 0, 0

            info['zona'] = zona_alvo
            info['linha'] = l
            info['coluna'] = c
            ocupado[zona_alvo].add((l, c))

        # Expand grids if any zone overflowed (all cells were occupied at placement)
        for zona, cfg in self.grid_config.items():
            max_cell = max(ocupado[zona], default=(-1, -1))
            if max_cell[0] >= cfg['linhas']:
                cfg['linhas'] = max_cell[0] + 1
            if max_cell[1] >= cfg['colunas']:
                cfg['colunas'] = max_cell[1] + 1

        if not self._headless:
            self.desenhar_painel()
            self.print_log("Componentes posicionados por categoria.")

    def detectar_redes_cad(self):
        if not self.cads_abertos: return
        self.print_log("Lendo IDs de rede originais do CADe_SIMU...")
        self.nets = []

        for cad_path in self.cads_abertos:
            comps = parse_cad(cad_path)
            nets_detectadas = detectar_nets(comps)
            for net_id, desc, terminais in nets_detectadas:
                term_strs = [f"{c}:{t}" for c, t in terminais if c in self.componentes]
                if len(term_strs) >= 2:
                    rede_existente = next((n for n in self.nets if set(n["terminais"]) == set(term_strs)), None)
                    if not rede_existente:
                        self.nets.append({"terminais": term_strs, "origem": None})
                        self.print_log(f"✓ {net_id}: {len(term_strs)} terminais")

        self.atualizar_lista_nets()
    def salvar_projeto(self):
        path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON", "*.json")])
        if path:
            layout_int = [["" for _ in range(self.grid_config["interno"]["colunas"])] for _ in range(self.grid_config["interno"]["linhas"])]
            layout_tmp = [["" for _ in range(self.grid_config["tampa"]["colunas"])] for _ in range(self.grid_config["tampa"]["linhas"])]
            
            for nome, info in self.componentes.items():
                if info["zona"] == "interno": layout_int[info["linha"]][info["coluna"]] = nome
                else: layout_tmp[info["linha"]][info["coluna"]] = nome
                
            dados = {"interno": {"grids": layout_int}, "tampa": {"grids": layout_tmp}}
            with open(path, "w", encoding="utf-8") as f: json.dump(dados, f, indent=4)
            self.print_log("JSON estrutural do painel salvo!")

    def carregar_projeto(self):
        path = filedialog.askopenfilename(filetypes=[("JSON", "*.json")])
        if path:
            with open(path, "r", encoding="utf-8") as f: dados = json.load(f)
            # Atualiza GUI baseado no JSON...
            self.print_log("Layout do Painel carregado. As lógicas virão do CAD.")

    def exportar_redes_debug(self):
        if not self.nets and not self.componentes:
            messagebox.showwarning("Atenção", "Nenhuma rede ou componente carregado.")
            return
            
        path = filedialog.asksaveasfilename(defaultextension=".txt", initialfile="redes_debug.txt", filetypes=[("Arquivo de Texto", "*.txt")])
        if path:
            try:
                with open(path, "w", encoding="utf-8") as f:
                    f.write("=== COMPONENTES DETECTADOS NO CAD ===\n")
                    for nome, info in self.componentes.items():
                        f.write(f"[{info['codigo']}] {nome} -> Terminais Lidos: {list(info['terminais'].keys())}\n")
                        
                    f.write("\n=== REDES (CONEXÕES) DETECTADAS ===\n")
                    for i, net in enumerate(self.nets):
                        f.write(f"Rede {i+1} Origem: {net.get('origem', 'Não definida')}\n")
                        for term in net["terminais"]:
                            f.write(f"   - {term}\n")
                            
                self.print_log(f"Log de depuração exportado em: {path}")
                messagebox.showinfo("Sucesso", "Arquivo de depuração exportado com sucesso!")
            except Exception as e:
                messagebox.showerror("Erro", f"Erro ao exportar: {e}")

    def gerar_saidas_oficiais(self):
        if not self.cads_abertos:
            messagebox.showwarning("Atenção", "Nenhum CAD aberto.")
            return

        # Salva posições dos componentes em painel_config.json
        self.salvar_projeto_temp()
        self.print_log("Config do painel salva: painel_config.json")

        cmd = [sys.executable, "analisar_cad.py", "auto"] + self.cads_abertos
        self.print_log(f"Rodando Motor Backend: {' '.join(cmd)}")

        try:
            r = subprocess.run(cmd, capture_output=True, text=True, cwd=self.base_dir)
            if r.returncode == 0:
                self.print_log("SUCESSO: Checklist, Anilhas e Relatório gerados na pasta do projeto.")
                messagebox.showinfo("Pronto!",
                    "Arquivos gerados na pasta do CAD:\n"
                    "• checklist_montagem.html — sequência de fios na ordem de montagem\n"
                    "• anilhas.html — etiquetas dos cabos\n"
                    "• relatorio_cabeamento.html — análise (ramificação, fios por terminal, alertas)")
            else:
                self.print_log("ERRO: \n" + r.stderr)
        except Exception as e:
            self.print_log(f"Falha subprocess: {e}")

    def salvar_projeto_temp(self):
        layouts = {}
        for zona_key in ("interno", "tampa", "externo"):
            cfg = self.grid_config.get(zona_key, {"linhas": 1, "colunas": 1})
            grid = [["" for _ in range(cfg["colunas"])] for _ in range(cfg["linhas"])]
            layouts[zona_key] = grid
        for nome, info in self.componentes.items():
            zona = info.get("zona", "interno")
            lin, col = info.get("linha", 0), info.get("coluna", 0)
            grid = layouts.get(zona)
            if grid and 0 <= lin < len(grid) and 0 <= col < len(grid[lin]):
                grid[lin][col] = nome
        dados = {z: {"grids": g} for z, g in layouts.items()}
        with open(self.base_dir / "painel_config.json", "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4)

    # --- UI Management ---
    def atualizar_grid(self):
        try:
            self.grid_config["interno"]["linhas"] = max(1, int(self.e_int_l.get()))
            self.grid_config["interno"]["colunas"] = max(1, int(self.e_int_c.get()))
            self.grid_config["tampa"]["linhas"] = max(1, int(self.e_tmp_l.get()))
            self.grid_config["tampa"]["colunas"] = max(1, int(self.e_tmp_c.get()))
            self.desenhar_painel()
        except ValueError: pass

    def novo_componente(self): ComponentEditor(self.root, None, {}, self.salvar_componente, grid_cfg=self.grid_config)
    def editar_componente(self, comp_nome): ComponentEditor(self.root, comp_nome, self.componentes[comp_nome], self.salvar_componente, self.excluir_componente, grid_cfg=self.grid_config)

    def salvar_componente(self, old_nome, new_nome, data):
        if old_nome and old_nome != new_nome:
            del self.componentes[old_nome]
        self.componentes[new_nome] = data
        self.atualizar_cb_terminais()
        self.desenhar_painel()

    def excluir_componente(self, comp_nome):
        del self.componentes[comp_nome]
        self.atualizar_cb_terminais()
        self.desenhar_painel()

    def nova_net(self):
        self.nets.append({"terminais": [], "origem": None})
        self.atualizar_lista_nets()
        self.list_nets.selection_clear(0, tk.END)
        self.list_nets.selection_set(tk.END)
        self.on_net_select(None)

    def excluir_net(self):
        if self.net_selecionada_idx >= 0:
            del self.nets[self.net_selecionada_idx]
            self.net_selecionada_idx = -1
            self.atualizar_lista_nets()
            self.desenhar_painel()

    def atualizar_lista_nets(self):
        self.list_nets.delete(0, tk.END)
        for i, net_dict in enumerate(self.nets):
            self.list_nets.insert(tk.END, f"Rede {i+1} ({len(net_dict['terminais'])} term)")

    def on_net_select(self, event):
        sel = self.list_nets.curselection()
        if sel:
            self.net_selecionada_idx = sel[0]
            self.list_term_net.delete(0, tk.END)
            terminais = self.nets[self.net_selecionada_idx]["terminais"]
            origem = self.nets[self.net_selecionada_idx].get("origem")
            for t in terminais:
                self.list_term_net.insert(tk.END, t)
            
            # Atualiza opções de origem
            self.cb_origem_net['values'] = [""] + terminais
            self.cb_origem_net.set(origem if origem in terminais else "")
            
            self.desenhar_painel()

    def on_origem_select(self, event):
        if self.net_selecionada_idx >= 0:
            val = self.cb_origem_net.get()
            self.nets[self.net_selecionada_idx]["origem"] = val if val else None

    def atualizar_cb_terminais(self):
        todos_terminals, todos_comps = [], []
        for c_nome, c_data in self.componentes.items():
            todos_comps.append(c_nome)
            for t_nome in c_data["terminais"].keys():
                todos_terminals.append(f"{c_nome}:{t_nome}")
        self.cb_term_disp['values'] = todos_terminals
        self.cb_comp_disp['values'] = todos_comps

    def add_term_na_net(self):
        if self.net_selecionada_idx < 0: return
        term = self.cb_term_disp.get()
        if term and term not in self.nets[self.net_selecionada_idx]["terminais"]:
            self.nets[self.net_selecionada_idx]["terminais"].append(term)
            self.atualizar_lista_nets()
            self.list_nets.selection_set(self.net_selecionada_idx)
            self.on_net_select(None)

    def add_comp_na_net(self):
        if self.net_selecionada_idx < 0: return
        comp = self.cb_comp_disp.get()
        if comp in self.componentes:
            for t_nome in self.componentes[comp]["terminais"].keys():
                term = f"{comp}:{t_nome}"
                if term not in self.nets[self.net_selecionada_idx]["terminais"]:
                    self.nets[self.net_selecionada_idx]["terminais"].append(term)
            self.atualizar_lista_nets()
            self.list_nets.selection_set(self.net_selecionada_idx)
            self.on_net_select(None)

    def remover_term_da_net(self):
        if self.net_selecionada_idx < 0: return
        sel = self.list_term_net.curselection()
        if sel:
            for idx in reversed(sel):
                del self.nets[self.net_selecionada_idx]["terminais"][idx]
            self.atualizar_lista_nets()
            self.list_nets.selection_set(self.net_selecionada_idx)
            self.on_net_select(None)

    # --- Routing Test Visual ---
    def gerar_rotas_todas(self):
        if self._headless:
            self._gerar_rotas_headless()
            return
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete(1.0, tk.END)
        self.log_text.config(state=tk.DISABLED)
        self.rota_atual = []
        custo_total_painel = 0
        impossiveis = 0

        for i, net_dict in enumerate(self.nets):
            net = net_dict["terminais"]
            if len(net) < 2: continue

            info_terminais = {}
            for item in net:
                comp, term = item.split(':')
                if comp not in self.componentes: continue
                dados_comp = self.componentes[comp]
                info_terminais[item] = {
                    "linha": dados_comp["linha"], "coluna": dados_comp["coluna"],
                    "zona": dados_comp["zona"], "limite": dados_comp["terminais"].get(term, 99)
                }

            roteador = RoteadorInteligenteVisual(self.componentes, info_terminais, self.grid_config)
            origem = net_dict.get("origem")
            terminais_validos = [t for t in net if t in info_terminais]
            rota, custo = roteador.rotear(terminais_validos, origem_forcada=origem)

            if not rota:
                self.print_log(f"--- REDE {i+1} --- IMPOSSÍVEL ROTEAR ({len(terminais_validos)} term)")
                impossiveis += 1
                continue

            self.print_log(f"--- REDE {i+1} --- Custo: {custo}  ({len(terminais_validos)} term)")
            for passo, (u, v) in enumerate(rota, 1):
                self.print_log(f"  [{passo}] {u} -> {v}")
                self.rota_atual.append((i, u, v))
            custo_total_painel += custo

        self.print_log("")
        self.print_log(f"=== MELHOR COMBINAÇÃO === custo total: {custo_total_painel}, redes impossíveis: {impossiveis}")
        self.desenhar_painel()

    # --- Canvas Physics ---
    def _y_ext_base(self):
        int_l = self.grid_config["interno"]["linhas"]
        H_INT = 30 * (int_l + 1) + int_l * 100
        return 80 + H_INT + 60

    def get_duct_y(self, zona, linha, is_top=False):
        # is_top=True  → duct ABOVE row (row index = linha)
        # is_top=False → duct BELOW row (row index = linha+1)
        base = self._y_ext_base() if zona == "externo" else 80
        duct_row = linha if is_top else (linha + 1)
        return base + duct_row * 130 + 15
    def _is_top_terminal(self, comp_nome, term_nome):
        if comp_nome not in self.componentes:
            return True
        terms = list(self.componentes[comp_nome]["terminais"].keys())
        for top, bot in emparelhar_terminais(terms):
            if term_nome == top:
                return True
            if term_nome == bot:
                return False
        return True

    def get_vert_duct_x(self, zona, side):
        w_int = 60 + (self.grid_config["interno"]["colunas"] * 100)
        if zona == "interno": return 65 if side == 'left' else 50 + w_int - 15
        return 50 + w_int + 80 + 15 

    def get_best_vert_x(self, zona, ux, vx):
        if zona == 'tampa': return self.get_vert_duct_x('tampa', 'left')
        xl, xr = self.get_vert_duct_x('interno', 'left'), self.get_vert_duct_x('interno', 'right')
        return xl if (abs(ux - xl) + abs(vx - xl)) < (abs(ux - xr) + abs(vx - xr)) else xr

    def get_grid_coords(self, zona, linha, coluna):
        w_int = 60 + (self.grid_config["interno"]["colunas"] * 100)
        if zona == "externo":
            return 50 + 30 + (coluna * 100) + 50, self._y_ext_base() + 30 + (linha * 130) + 50
        cx = 50 if zona == "interno" else 50 + w_int + 80
        return cx + 30 + (coluna * 100) + 50, 80 + 30 + (linha * 130) + 50

    def resolver_posicao_mouse(self, x, y):
        w_int = 60 + (self.grid_config["interno"]["colunas"] * 100)
        off_tmp = 50 + w_int + 80
        Y_EXT = self._y_ext_base()
        if y >= Y_EXT and x < off_tmp - 40:
            zona = "externo"
            cfg = self.grid_config["externo"]
            col = max(0, min(round((x - 50 - 80) / 100), cfg["colunas"] - 1))
            lin = max(0, min(round((y - Y_EXT - 80) / 130), cfg["linhas"] - 1))
            return zona, lin, col
        zona = "tampa" if x > off_tmp - 40 else "interno"
        base_x = off_tmp if zona == "tampa" else 50
        col = max(0, min(round((x - base_x - 80) / 100), self.grid_config[zona]["colunas"] - 1))
        lin = max(0, min(round((y - 80 - 80) / 130), self.grid_config[zona]["linhas"] - 1))
        return zona, lin, col

    def desenhar_painel(self):
        self.canvas.delete("all")
        int_l, int_c = self.grid_config["interno"]["linhas"], self.grid_config["interno"]["colunas"]
        tmp_l, tmp_c = self.grid_config["tampa"]["linhas"], self.grid_config["tampa"]["colunas"]
        ext_l, ext_c = self.grid_config["externo"]["linhas"], self.grid_config["externo"]["colunas"]

        W_INT, H_INT = 60 + (int_c * 100), 30 * (int_l + 1) + (int_l * 100)
        W_TMP, H_TMP = 30 + (tmp_c * 100), 30 * (tmp_l + 1) + (tmp_l * 100)
        W_EXT, H_EXT = 60 + (ext_c * 100), 30 * (ext_l + 1) + (ext_l * 100)
        O_TMP_X = 50 + W_INT + 80
        Y_EXT = 80 + H_INT + 60

        self.canvas.create_rectangle(30, 40, 50+W_INT+20, 80+H_INT+20, fill="#b5b5b5", outline="#777", width=2)
        self.canvas.create_text(50, 55, text="CHAPA DE MONTAGEM (INTERNO)", font=("Arial", 11, "bold"), anchor="w", fill="#333")
        self.canvas.create_rectangle(O_TMP_X-20, 40, O_TMP_X+W_TMP+20, 80+H_TMP+20, fill="#c9c9c9", outline="#777", width=2)
        self.canvas.create_text(O_TMP_X, 55, text="PORTA DO PAINEL (TAMPA)", font=("Arial", 11, "bold"), anchor="w", fill="#333")

        cor_canal = "#383838"
        self.canvas.create_rectangle(50, 80, 80, 80+H_INT, fill=cor_canal, outline="#222")
        self.canvas.create_rectangle(50+W_INT-30, 80, 50+W_INT, 80+H_INT, fill=cor_canal, outline="#222")
        for l in range(int_l + 1): self.canvas.create_rectangle(80, 80 + l*130, 50+W_INT-30, 80+l*130+30, fill=cor_canal, outline="#222")

        self.canvas.create_rectangle(O_TMP_X, 80, O_TMP_X+30, 80+H_TMP, fill=cor_canal, outline="#222")
        for l in range(tmp_l + 1): self.canvas.create_rectangle(O_TMP_X+30, 80 + l*130, O_TMP_X+W_TMP, 80+l*130+30, fill=cor_canal, outline="#222")

        self.canvas.create_line(50+W_INT-15, 80+H_INT, 50+W_INT-15, 80+H_INT+50, O_TMP_X+15, 80+H_TMP+50, O_TMP_X+15, 80+H_TMP, fill="#111", width=16, smooth=True)

        # Externo zone
        self.canvas.create_rectangle(30, Y_EXT-20, 50+W_EXT+20, Y_EXT+H_EXT+20, fill="#8b9d77", outline="#556b2f", width=2)
        self.canvas.create_text(50, Y_EXT-5, text="ÁREA EXTERNA (MOTORES / CARGA)", font=("Arial", 11, "bold"), anchor="w", fill="#1a3300")
        self.canvas.create_rectangle(50, Y_EXT, 80, Y_EXT+H_EXT, fill=cor_canal, outline="#222")
        self.canvas.create_rectangle(50+W_EXT-30, Y_EXT, 50+W_EXT, Y_EXT+H_EXT, fill=cor_canal, outline="#222")
        for l in range(ext_l + 1): self.canvas.create_rectangle(80, Y_EXT + l*130, 50+W_EXT-30, Y_EXT + l*130+30, fill=cor_canal, outline="#222")
        # Cable exit: left duct of interno → top of externo
        self.canvas.create_line(65, 80+H_INT, 65, Y_EXT, fill="#1a1a1a", width=6, dash=(10, 4))

        coords_terminais = {}
        for comp_nome, info in self.componentes.items():
            cx, cy = self.get_grid_coords(info["zona"], info["linha"], info["coluna"])
            terms = list(info["terminais"].keys())
            colunas = emparelhar_terminais(terms)
            n_col = max(1, len(colunas))
            w = max(60, n_col * 20 + 10)
            x1, y1 = cx - w/2, cy - 30
            x2, y2 = cx + w/2, cy + 30

            em_net = self.net_selecionada_idx >= 0 and any(t.startswith(comp_nome+":") for t in self.nets[self.net_selecionada_idx]["terminais"]) if self.nets else False
            tag = f"comp_{comp_nome}"
            self.canvas.create_rectangle(x1+4, y1+4, x2+4, y2+4, fill="#1a1a1a", tags=(tag,))
            self.canvas.create_rectangle(x1, y1, x2, y2, fill="#9bc4e2" if em_net else "#ddd", outline="#222", width=2, tags=(tag,))
            self.canvas.create_text(cx, cy-8, text=comp_nome, font=("Segoe UI", 10, "bold"), tags=(tag,))

            col_step = w / (n_col + 1)
            for i, (top_term, bot_term) in enumerate(colunas):
                tx = x1 + col_step * (i + 1)
                if top_term is not None and bot_term is None:
                    # Solo: centraliza verticalmente (PE, N, etc.)
                    ty = y1 + 12 if top_term[-1].isdigit() and top_term[-1] in ("1","3","5") else (y1 + y2) / 2
                    coords_terminais[f"{comp_nome}:{top_term}"] = (tx, ty)
                    self.canvas.create_oval(tx-4, ty-4, tx+4, ty+4, fill="#d4d4d4", tags=(tag,))
                    self.canvas.create_text(tx, ty - 12 if ty < cy else ty + 12, text=top_term, font=("Arial", 7, "bold"), tags=(tag,))
                    continue
                if top_term is not None:
                    ty_top = y1 + 12
                    coords_terminais[f"{comp_nome}:{top_term}"] = (tx, ty_top)
                    self.canvas.create_oval(tx-4, ty_top-4, tx+4, ty_top+4, fill="#d4d4d4", tags=(tag,))
                    self.canvas.create_text(tx, ty_top - 12, text=top_term, font=("Arial", 7, "bold"), tags=(tag,))
                if bot_term is not None:
                    ty_bot = y2 - 12
                    coords_terminais[f"{comp_nome}:{bot_term}"] = (tx, ty_bot)
                    self.canvas.create_oval(tx-4, ty_bot-4, tx+4, ty_bot+4, fill="#d4d4d4", tags=(tag,))
                    self.canvas.create_text(tx, ty_bot + 12, text=bot_term, font=("Arial", 7, "bold"), tags=(tag,))

        for net_idx, u, v in self.rota_atual:
            if u not in coords_terminais or v not in coords_terminais:
                continue
            ux, uy = coords_terminais[u]
            vx, vy = coords_terminais[v]
            comp_u, term_u = u.split(':')
            comp_v, term_v = v.split(':')
            z_u = self.componentes[comp_u]["zona"]
            z_v = self.componentes[comp_v]["zona"]
            l_u = self.componentes[comp_u]["linha"]
            l_v = self.componentes[comp_v]["linha"]
            is_top_u = self._is_top_terminal(comp_u, term_u)
            is_top_v = self._is_top_terminal(comp_v, term_v)
            cor = gerar_cor_net(net_idx)

            # Per-net lane offsets: Y for horizontal ducts, X for vertical ducts
            jit_y = (net_idx % 7 - 3) * 3
            jit_x = (net_idx % 5 - 2) * 3

            ydu = self.get_duct_y(z_u, l_u, is_top_u) + jit_y
            ydv = self.get_duct_y(z_v, l_v, is_top_v) + jit_y
            path = [(ux, uy), (ux, ydu)]

            if z_u == z_v:
                if ydu == ydv:
                    # Same horizontal duct: route directly across
                    path.append((vx, ydu))
                else:
                    xv = self.get_best_vert_x(z_u, ux, vx) + jit_x
                    path.extend([(xv, ydu), (xv, ydv), (vx, ydv)])
            else:
                # Cross-zone: motor (externo) sai pela canaleta ESQUERDA do interno;
                # tampa entra pela ESQUERDA dela. Interno↔tampa usa direita.
                envolve_externo = (z_u == "externo" or z_v == "externo")

                def _xv_zona(z):
                    if z == "interno":
                        return self.get_vert_duct_x("interno", "left" if envolve_externo else "right")
                    if z == "tampa":
                        return self.get_vert_duct_x("tampa", "left")
                    # externo
                    return 65  # centro da canaleta esquerda do externo

                xvu = _xv_zona(z_u) + jit_x
                xvv = _xv_zona(z_v) + jit_x
                ybu = self.get_duct_y(z_u, self.grid_config[z_u]["linhas"] - 1, is_top=False) + jit_y
                ybv = self.get_duct_y(z_v, self.grid_config[z_v]["linhas"] - 1, is_top=False) + jit_y

                if envolve_externo:
                    # Sai do interno por baixo da canaleta esquerda → desce direto até externo
                    path.extend([
                        (xvu, ydu), (xvu, ybu), (xvu, ybv),
                        (xvv, ybv), (xvv, ydv), (vx, ydv),
                    ])
                else:
                    # Interno ↔ Tampa: passa pela dobradiça (chicote inferior)
                    path.extend([
                        (xvu, ydu), (xvu, ybu),
                        (xvu, 80 + H_INT + 25 + jit_y),
                        (xvv, 80 + H_TMP + 25 + jit_y),
                        (xvv, ybv), (xvv, ydv), (vx, ydv),
                    ])

            path.append((vx, vy))
            for p in range(len(path) - 1):
                self.canvas.create_line(
                    path[p][0], path[p][1], path[p+1][0], path[p+1][1],
                    fill=cor, width=2.5,
                    arrow=tk.LAST if p == len(path) - 2 else tk.NONE,
                )

    def on_double_click(self, e):
        i = self.canvas.find_withtag("current")
        if i:
            for t in self.canvas.gettags(i[0]):
                if t.startswith("comp_"): self.editar_componente(t[5:]); break
    def on_drag_start(self, e):
        i = self.canvas.find_withtag("current")
        if i:
            for t in self.canvas.gettags(i[0]):
                if t.startswith("comp_"): self.drag_data = {"item": t, "comp_nome": t[5:], "start_x": e.x, "start_y": e.y}; break
    def on_drag_motion(self, e):
        if self.drag_data["item"]:
            self.canvas.move(self.drag_data["item"], e.x - self.drag_data["start_x"], e.y - self.drag_data["start_y"])
            self.drag_data["start_x"], self.drag_data["start_y"] = e.x, e.y
    def on_drag_release(self, e):
        if self.drag_data["comp_nome"]:
            c = self.drag_data["comp_nome"]
            z, l, cl = self.resolver_posicao_mouse(e.x, e.y)
            self.componentes[c].update({"zona": z, "linha": l, "coluna": cl})
            self.drag_data = {"item": None, "comp_nome": None, "start_x": 0, "start_y": 0}
            self.desenhar_painel()

    def abrir_cads_paths(self, paths):
        """Carrega CADs sem dialog tkinter — usado pelo pywebview."""
        if not paths:
            return
        self.cads_abertos = list(paths)
        cad_path_main = Path(paths[0])
        proj_folder = cad_path_main.parent / cad_path_main.stem
        # WinError 183: if a FILE (not dir) with the same stem already exists,
        # mkdir fails even with exist_ok=True. Fall back to a _painel subfolder.
        try:
            proj_folder.mkdir(parents=True, exist_ok=True)
        except OSError:
            proj_folder = cad_path_main.parent / (cad_path_main.stem + "_painel")
            proj_folder.mkdir(parents=True, exist_ok=True)
        self.base_dir = proj_folder
        todos_componentes = {}
        for cad_path in paths:
            try:
                comps_cad = parse_cad(cad_path)
                for comp in comps_cad:
                    if comp.get('tipo') == 'wire':
                        continue
                    nome = comp.get('nome', '').strip() or f"{comp.get('codigo','?')}_{comp.get('id','')}"
                    terminais = comp.get('terminais', [])
                    if nome in todos_componentes:
                        existente = todos_componentes[nome]
                        cat_nova = comp.get('tipo', 'outro') or 'outro'
                        cat_atual = existente.get('categoria', 'outro')
                        prio_nova = PRIORIDADE_CATEGORIA.index(cat_nova) if cat_nova in PRIORIDADE_CATEGORIA else len(PRIORIDADE_CATEGORIA)
                        prio_atual = PRIORIDADE_CATEGORIA.index(cat_atual) if cat_atual in PRIORIDADE_CATEGORIA else len(PRIORIDADE_CATEGORIA)
                        if prio_nova < prio_atual:
                            existente['categoria'] = cat_nova
                        for term in terminais:
                            if term not in existente['terminais']:
                                limite = 1 if nome.startswith('T') else (3 if (nome.startswith('K') or nome.startswith('DJ')) else 99)
                                existente['terminais'][term] = limite
                        continue
                    tdict = {}
                    for term in terminais:
                        limite = 1 if nome.startswith('T') else (3 if (nome.startswith('K') or nome.startswith('DJ')) else 99)
                        tdict[term] = limite
                    todos_componentes[nome] = {
                        'zona': 'interno', 'linha': 0, 'coluna': 0,
                        'terminais': tdict, 'codigo': comp.get('codigo', 'outro'),
                        'categoria': comp.get('tipo', 'outro') or 'outro',
                        'x': comp.get('x', 0), 'y': comp.get('y', 0)
                    }
            except Exception as e:
                print(f"Erro ao ler {cad_path}: {e}")
        self.componentes = todos_componentes
        if not self._headless:
            self.atualizar_cb_terminais()
            self.detectar_redes_cad()
            self.desenhar_painel()
        else:
            # Webview mode: detectar nets e posicionar
            try:
                from analisar_cad import detectar_nets
                self.nets = []
                for cad_path in paths:
                    comps = parse_cad(cad_path)
                    nets_detectadas = detectar_nets(comps)
                    for net_id, desc, terminais in nets_detectadas:
                        term_strs = [f"{c}:{t}" for c, t in terminais if c in self.componentes]
                        if len(term_strs) >= 2:
                            existe = any(set(n["terminais"]) == set(term_strs) for n in self.nets)
                            if not existe:
                                self.nets.append({"nome": net_id, "terminais": term_strs, "origem": None})
                print(f"Redes detectadas: {len(self.nets)}")
            except Exception as e:
                print(f"Erro ao detectar redes: {e}")
                import traceback; traceback.print_exc()

            # Restaurar posições salvas se painel_config.json existir
            config_path = self.base_dir / "painel_config.json"
            restaurados = self._restaurar_posicoes(config_path)
            if restaurados == 0:
                # Sem config salva → auto-posicionar tudo
                self.auto_posicionar_componentes()
            else:
                # Posicionar apenas os componentes não presentes na config
                nao_posicionados = [n for n in self.componentes if self.componentes[n]["linha"] == 0 and self.componentes[n]["coluna"] == 0 and self.componentes[n]["zona"] == "interno"]
                # Só auto-posicionar se há novos componentes (não cobertos pela config)
                novos = [n for n in nao_posicionados if n not in restaurados]
                if novos:
                    self.auto_posicionar_componentes()
                print(f"Posições restauradas: {len(restaurados)} componentes")

    def _salvar_estado(self):
        """Salva estado para JSON — sem dialog."""
        self.salvar_projeto_temp()

    def _restaurar_posicoes(self, config_path):
        """Carrega painel_config.json e aplica posições salvas. Retorna set de nomes restaurados."""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
        except Exception:
            return set()
        restaurados = set()
        for zona in ("interno", "tampa", "externo"):
            grids = config.get(zona, {}).get("grids", [])
            for lin_idx, row in enumerate(grids):
                for col_idx, nome in enumerate(row):
                    if nome and nome in self.componentes:
                        self.componentes[nome]["zona"] = zona
                        self.componentes[nome]["linha"] = lin_idx
                        self.componentes[nome]["coluna"] = col_idx
                        restaurados.add(nome)
        return restaurados

    def _gerar_rotas_headless(self):
        """Algoritmo de roteamento sem print_log/desenhar_painel."""
        self.rota_atual = []
        for i, net_dict in enumerate(self.nets):
            net = net_dict.get("terminais", [])
            if len(net) < 2:
                continue
            info_terminais = {}
            for item in net:
                parts = item.split(':')
                if len(parts) != 2:
                    continue
                comp, term = parts
                if comp not in self.componentes:
                    continue
                dados_comp = self.componentes[comp]
                info_terminais[item] = {
                    "linha": dados_comp["linha"], "coluna": dados_comp["coluna"],
                    "zona": dados_comp["zona"], "limite": dados_comp["terminais"].get(term, 99)
                }
            roteador = RoteadorInteligenteVisual(self.componentes, info_terminais, self.grid_config)
            origem = net_dict.get("origem")
            terminais_validos = [t for t in net if t in info_terminais]
            rota, _ = roteador.rotear(terminais_validos, origem_forcada=origem)
            if rota:
                for u, v in rota:
                    self.rota_atual.append((i, u, v))


# ── Webview launcher ───────────────────────────────────────────────────────────

def launch_webview():
    """Abre o painel no modo React/pywebview (sem janela tkinter visível)."""
    import os
    try:
        import webview
    except ImportError:
        print("pywebview não instalado. Rode: pip install pywebview")
        return

    from panel_api import PanelApi

    # Cria root oculto — widgets ainda são criados mas a janela fica escondida
    root = tk.Tk()
    root.withdraw()
    app = SimuladorApp.__new__(SimuladorApp)
    app.root = root
    app.root.title("CadeSIMU Backend")
    app.base_dir = Path.cwd()
    app.cads_abertos = []
    app.grid_config = {
        "interno": {"linhas": 4, "colunas": 6},
        "tampa":   {"linhas": 4, "colunas": 4},
        "externo": {"linhas": 1, "colunas": 3},
    }
    app.componentes = {}
    app.nets = []
    app.net_selecionada_idx = -1
    app.rota_atual = []
    app.drag_data = {"item": None, "comp_nome": None, "start_x": 0, "start_y": 0}
    app._headless = True

    api = PanelApi(app)

    # Adiciona open_cad_dialog ao api (usa tkinter filedialog em background)
    def open_cad_dialog():
        import tkinter.filedialog as fd
        paths = fd.askopenfilenames(
            title="Abrir CADe_SIMU (.cad)",
            filetypes=[("CAD", "*.cad"), ("Todos", "*.*")],
            parent=root,
        )
        if paths:
            return list(paths)[0]
        return None

    api.open_cad_dialog = open_cad_dialog

    dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), "painel_react", "dist", "index.html")
    dev_url = "http://localhost:5173"

    url = dev_url if os.environ.get("CADESIM_DEV") else f"file:///{dist.replace(os.sep, '/')}"

    window = webview.create_window(
        "CadeSIMU Painel",
        url=url,
        js_api=api,
        width=1440,
        height=900,
        resizable=True,
    )
    webview.start(debug=bool(os.environ.get("CADESIM_DEV")))
    root.quit()


if __name__ == "__main__":
    import sys
    if "--webview" in sys.argv:
        launch_webview()
    else:
        root = tk.Tk()
        app = SimuladorApp(root)
        root.mainloop()