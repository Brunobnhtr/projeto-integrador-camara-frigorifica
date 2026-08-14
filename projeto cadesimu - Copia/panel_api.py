import json
import colorsys
import subprocess
import sys
from pathlib import Path

_BASE_CORES = [
    "#00e6b8", "#e63366", "#e6e600", "#e67a00",
    "#9933cc", "#0099cc", "#cc6666", "#66cc66",
    "#6666cc", "#cc66cc", "#cccc66", "#66cccc",
]
_EXTRA_HUES   = [0, 210, 120, 40, 280, 170]
_EXTRA_LEVELS = [(0.50, 0.95), (0.85, 0.65), (1.00, 0.40)]

def _gerar_cor_net(idx):
    if idx < len(_BASE_CORES):
        return _BASE_CORES[idx]
    extra = idx - len(_BASE_CORES)
    hue_deg = _EXTRA_HUES[extra % len(_EXTRA_HUES)]
    s, v = _EXTRA_LEVELS[(extra // len(_EXTRA_HUES)) % len(_EXTRA_LEVELS)]
    r, g, b = colorsys.hsv_to_rgb(hue_deg / 360, s, v)
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"


def emparelhar_terminais(terminais):
    usado = set()
    colunas = []
    for t in terminais:
        if t in usado:
            continue
        partner = None
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
            colunas.append((t, None))
            usado.add(t)
    return colunas


_TERMOS_FORCA_MAIN = {'PE', 'N', 'U', 'V', 'W', 'R', 'S', 'T'}

def _tipo_coluna(top, bot):
    """Classifica um par de terminais como 'power', 'coil' ou 'aux'."""
    import re
    for t in filter(None, [top, bot]):
        u = t.upper()
        if re.match(r'^[AB][12]$', u):            return 'coil'
        if u.isdigit() and 1 <= int(u) <= 6:      return 'power'
        if u in _TERMOS_FORCA_MAIN:                return 'power'
        if re.match(r'^[LT][1-3]$', u):           return 'power'
        if re.match(r'^X[12]$', u):                return 'power'
    return 'aux'


def emparelhar_e_ordenar(terminais):
    """Emparelha e ordena: aux(esq) | força | bobina | aux(dir)."""
    colunas = emparelhar_terminais(terminais)
    power = [c for c in colunas if _tipo_coluna(*c) == 'power']
    coil  = [c for c in colunas if _tipo_coluna(*c) == 'coil']
    aux   = [c for c in colunas if _tipo_coluna(*c) == 'aux']
    mid   = len(aux) // 2
    return aux[:mid] + power + coil + aux[mid:]


class PanelApi:
    """API Python exposta ao JavaScript via pywebview."""

    def __init__(self, app):
        self.app = app
        self._log = []
        self._webview_window = None  # Set by launch_webview after start

    def _add_log(self, text):
        self._log.append(str(text))
        if len(self._log) > 300:
            self._log.pop(0)

    # ── Layout helpers (mirrors painel_gui.py) ──────────────────────────────

    # ── Grid constants ──────────────────────────────────────────────────────────
    # ROW_STEP=160px (30 duct + 20 gap + 80 node + 20 gap + 10 margin below sq)
    # COL_STEP=130px (30 vert-duct + node width up to ~110px + margin)
    # DUCT_H=30px, NODE_H=80px, COMP_Y_OFF=90 (30+20+40 = duct+gap+half-node)
    ROW_STEP   = 160
    COL_STEP   = 130
    DUCT_H     = 30
    COMP_Y_OFF = 90   # offset from row_base to component center

    def _y_ext_base(self):
        int_l = self.app.grid_config["interno"]["linhas"]
        H_INT = self.DUCT_H * (int_l + 1) + int_l * (self.ROW_STEP - self.DUCT_H)
        return 80 + H_INT + 60

    def _dims(self):
        gc = self.app.grid_config
        int_l, int_c = gc["interno"]["linhas"], gc["interno"]["colunas"]
        tmp_l, tmp_c = gc["tampa"]["linhas"],   gc["tampa"]["colunas"]
        ext_l, ext_c = gc["externo"]["linhas"], gc["externo"]["colunas"]
        RS, CS, DH = self.ROW_STEP, self.COL_STEP, self.DUCT_H
        W_INT = 60 + int_c * CS
        H_INT = DH * (int_l + 1) + int_l * (RS - DH)
        W_TMP = 30 + tmp_c * CS
        H_TMP = DH * (tmp_l + 1) + tmp_l * (RS - DH)
        W_EXT = 60 + ext_c * CS
        H_EXT = DH * (ext_l + 1) + ext_l * (RS - DH)
        O_TMP_X = 50 + W_INT + 80
        Y_EXT = 80 + H_INT + 60
        return dict(
            W_INT=W_INT, H_INT=H_INT,
            W_TMP=W_TMP, H_TMP=H_TMP,
            W_EXT=W_EXT, H_EXT=H_EXT,
            O_TMP_X=O_TMP_X, Y_EXT=Y_EXT,
            ROW_STEP=self.ROW_STEP, COL_STEP=self.COL_STEP, DUCT_H=self.DUCT_H,
        )

    def _get_grid_coords(self, zona, linha, coluna):
        gc = self.app.grid_config
        w_int = 60 + gc["interno"]["colunas"] * self.COL_STEP
        # cx = zone_left + vert_duct(30) + col*COL_STEP + half_col_step
        # cy = panel_top(80) + COMP_Y_OFF + row*ROW_STEP
        half_cs = self.COL_STEP // 2
        if zona == "externo":
            return (50 + 30 + coluna * self.COL_STEP + half_cs,
                    self._y_ext_base() + self.COMP_Y_OFF + linha * self.ROW_STEP)
        cx_base = 50 if zona == "interno" else 50 + w_int + 80
        return (cx_base + 30 + coluna * self.COL_STEP + half_cs,
                80 + self.COMP_Y_OFF + linha * self.ROW_STEP)

    def _get_duct_y(self, zona, linha, is_top=False):
        base = self._y_ext_base() if zona == "externo" else 80
        duct_row = linha if is_top else (linha + 1)
        return base + duct_row * self.ROW_STEP + self.DUCT_H // 2

    def _get_vert_duct_x(self, zona, side):
        w_int = 60 + self.app.grid_config["interno"]["colunas"] * self.COL_STEP
        if zona == "interno":
            return 65 if side == 'left' else 50 + w_int - 15
        return 50 + w_int + 80 + 15

    def _get_best_vert_x(self, zona, ux, vx):
        if zona == 'tampa':
            return self._get_vert_duct_x('tampa', 'left')
        xl = self._get_vert_duct_x('interno', 'left')
        xr = self._get_vert_duct_x('interno', 'right')
        return xl if (abs(ux - xl) + abs(vx - xl)) < (abs(ux - xr) + abs(vx - xr)) else xr

    def _colunas_for(self, comp_nome, terms):
        """Entrada components: all terminals on top (single row). Others: paired top/bot."""
        cat = self.app.componentes.get(comp_nome, {}).get('categoria', 'outro')
        if cat == 'entrada':
            return [(t, None) for t in terms]
        return emparelhar_e_ordenar(terms)

    def _is_top_terminal(self, comp_nome, term_nome):
        cat = self.app.componentes.get(comp_nome, {}).get('categoria', 'outro')
        if cat == 'entrada':
            return True  # all entrada terminals are on top
        if comp_nome not in self.app.componentes:
            return True
        terms = list(self.app.componentes[comp_nome]["terminais"].keys())
        for top, bot in emparelhar_e_ordenar(terms):
            if term_nome == top:
                return True
            if term_nome == bot:
                return False
        return True

    def _comp_width(self, n_col):
        # Each column needs ~18px so squares (16px) don't overlap; +2 per slot margin
        return max(60, (n_col + 1) * 18)

    def _terminal_coords(self, comp_nome):
        info = self.app.componentes[comp_nome]
        cx, cy = self._get_grid_coords(info["zona"], info["linha"], info["coluna"])
        terms = list(info["terminais"].keys())
        colunas = self._colunas_for(comp_nome, terms)
        n_col = max(1, len(colunas))
        w = self._comp_width(n_col)
        # Node height = 80px: cy-40 (top) .. cy+40 (bottom)
        x1, y1 = cx - w / 2, cy - 40
        x2, y2 = cx + w / 2, cy + 40
        result = {}
        col_step = w / (n_col + 1)
        # Terminals sit 8px OUTSIDE the node border (flush with terminal square)
        EXT = 8
        for i, (top_term, bot_term) in enumerate(colunas):
            tx = x1 + col_step * (i + 1)
            if top_term is not None:
                result[top_term] = (tx, y1 - EXT)
            if bot_term is not None:
                result[bot_term] = (tx, y2 + EXT)
        return result

    def _compute_wire_path(self, net_idx, u, v, u_idx=0, u_total=1, v_idx=0, v_total=1, seg_idx=0):
        comp_u, term_u = u.split(':')
        comp_v, term_v = v.split(':')
        cu = self._terminal_coords(comp_u)
        cv = self._terminal_coords(comp_v)
        if term_u not in cu or term_v not in cv:
            return []
        ux, uy = cu[term_u]
        vx, vy = cv[term_v]
        # Offset parallel wires at same terminal (jumpers) — fan out symmetrically
        JUMP_STEP = 3  # px between parallel wires
        if u_total > 1:
            ux += (u_idx - (u_total - 1) / 2) * JUMP_STEP
        if v_total > 1:
            vx += (v_idx - (v_total - 1) / 2) * JUMP_STEP
        gc = self.app.grid_config
        z_u = self.app.componentes[comp_u]["zona"]
        z_v = self.app.componentes[comp_v]["zona"]
        l_u = self.app.componentes[comp_u]["linha"]
        l_v = self.app.componentes[comp_v]["linha"]
        is_top_u = self._is_top_terminal(comp_u, term_u)
        is_top_v = self._is_top_terminal(comp_v, term_v)
        # Spread wires across the duct using segment index so each wire has a unique lane
        jit_y = (seg_idx % 9 - 4) * 3   # ±12px across 9 lanes within 30px duct
        jit_x = (seg_idx % 5 - 2) * 3   # ±6px for vertical duct x
        ydu = self._get_duct_y(z_u, l_u, is_top_u) + jit_y
        ydv = self._get_duct_y(z_v, l_v, is_top_v) + jit_y
        path = [[ux, uy], [ux, ydu]]
        d = self._dims()
        H_INT, H_TMP = d["H_INT"], d["H_TMP"]
        if z_u == z_v:
            if ydu == ydv:
                path.append([vx, ydu])
            else:
                xv = self._get_best_vert_x(z_u, ux, vx) + jit_x
                path.extend([[xv, ydu], [xv, ydv], [vx, ydv]])
        else:
            envolve_externo = (z_u == "externo" or z_v == "externo")

            def _xv(z):
                if z == "interno":
                    return self._get_vert_duct_x("interno", "left" if envolve_externo else "right")
                if z == "tampa":
                    return self._get_vert_duct_x("tampa", "left")
                return 65

            xvu = _xv(z_u) + jit_x
            xvv = _xv(z_v) + jit_x
            ybu = self._get_duct_y(z_u, gc[z_u]["linhas"] - 1, is_top=False) + jit_y
            ybv = self._get_duct_y(z_v, gc[z_v]["linhas"] - 1, is_top=False) + jit_y
            if envolve_externo:
                path.extend([[xvu, ydu], [xvu, ybu], [xvu, ybv],
                              [xvv, ybv], [xvv, ydv], [vx, ydv]])
            else:
                path.extend([
                    [xvu, ydu], [xvu, ybu],
                    [xvu, 80 + H_INT + 25 + jit_y],
                    [xvv, 80 + H_TMP + 25 + jit_y],
                    [xvv, ybv], [xvv, ydv], [vx, ydv],
                ])
        path.append([vx, vy])
        return path

    # ── Public API (called from JS) ─────────────────────────────────────────

    def get_panel_data(self):
        """Return full panel state as JSON string."""
        app = self.app
        gc = app.grid_config
        d = self._dims()

        nodes = []
        for nome, info in app.componentes.items():
            cx, cy = self._get_grid_coords(info["zona"], info["linha"], info["coluna"])
            terms = list(info["terminais"].keys())
            colunas = self._colunas_for(nome, terms)
            n_col = max(1, len(colunas))
            w = self._comp_width(n_col)
            nodes.append({
                "id": nome,
                "type": "component",
                "position": {"x": cx - w / 2, "y": cy - 40},
                "data": {
                    "nome": nome,
                    "terminais": info["terminais"],
                    "colunas": [[t, b] for t, b in colunas],
                    "categoria": info.get("categoria", "outro"),
                    "zona": info["zona"],
                    "linha": info["linha"],
                    "coluna": info["coluna"],
                    "w": w,
                    "cx": cx,
                    "cy": cy,
                    "propriedades": info.get("propriedades", {}),
                },
                "dragHandle": ".node-drag-handle",
            })

        # Pre-compute jumper offsets: count how many wires share each terminal
        from collections import defaultdict
        _term_count = defaultdict(int)
        _term_idx   = {}
        for si, (_, u, v) in enumerate(app.rota_atual):
            _term_idx[(si, 'u')] = _term_count[u]; _term_count[u] += 1
            _term_idx[(si, 'v')] = _term_count[v]; _term_count[v] += 1

        edges = []
        for seg_idx, (net_idx, u, v) in enumerate(app.rota_atual):
            u_i = _term_idx[(seg_idx, 'u')]; u_n = _term_count[u]
            v_i = _term_idx[(seg_idx, 'v')]; v_n = _term_count[v]
            path = self._compute_wire_path(net_idx, u, v, u_i, u_n, v_i, v_n, seg_idx)
            if not path:
                continue
            net_nome = app.nets[net_idx]["nome"] if net_idx < len(app.nets) else str(net_idx)
            # PE nets get yellow-green regardless of net index
            net_terms = app.nets[net_idx].get("terminais", []) if net_idx < len(app.nets) else []
            is_pe = any(str(t).split(':')[-1].upper() == 'PE' for t in net_terms)
            cor = '#84cc16' if is_pe else _gerar_cor_net(net_idx)
            comp_u = u.split(':')[0]
            comp_v = v.split(':')[0]
            edges.append({
                "id": f"e{seg_idx}_{u}_{v}",
                "source": comp_u,
                "target": comp_v,
                "type": "wire",
                "data": {
                    "path": path,
                    "cor": cor,
                    "netIdx": net_idx,
                    "netNome": net_nome,
                    "tipo": "terra" if is_pe else None,
                    "u": u,
                    "v": v,
                    "segIdx": seg_idx,
                },
            })

        nets_serializable = []
        for ni, net in enumerate(app.nets):
            net_t = net.get("terminais", [])
            is_net_pe = any(str(t).split(':')[-1].upper() == 'PE' for t in net_t)
            nets_serializable.append({
                "nome": net.get("nome", ""),
                "terminais": net_t,
                "origem": net.get("origem"),
                "tipo": "terra" if is_net_pe else None,
                "cor": '#84cc16' if is_net_pe else _gerar_cor_net(ni),
            })

        return json.dumps({
            "nodes": nodes,
            "edges": edges,
            "nets": nets_serializable,
            "grid_config": gc,
            "dims": d,
            "net_selecionada_idx": app.net_selecionada_idx,
            "cads_abertos": [str(p) for p in app.cads_abertos],
        })

    def browse_and_load_cad(self):
        """Abre dialog nativo do pywebview para escolher .cad e carrega."""
        try:
            import webview
            wins = webview.windows
            if wins:
                result = wins[0].create_file_dialog(
                    webview.OPEN_DIALOG,
                    allow_multiple=True,
                    file_types=('CAD files (*.cad)', 'All files (*.*)')
                )
                if result:
                    return self.load_cad_multi(list(result))
        except Exception as e:
            self._add_log(f"Erro ao abrir dialog: {e}")
        return self.get_panel_data()

    def load_cad(self, filepath):
        """Load a single .cad file and return updated panel data."""
        return self.load_cad_multi([filepath])

    def load_cad_multi(self, filepaths):
        """Load one or more .cad files and return updated panel data."""
        for fp in filepaths:
            self._add_log(f"Carregando: {Path(fp).name}")
        try:
            self.app.abrir_cads_paths(list(filepaths))
            self._add_log(f"✓ {len(filepaths)} arquivo(s) carregado(s) — "
                          f"{len(self.app.componentes)} componentes, {len(self.app.nets)} redes")
        except Exception as e:
            self._add_log(f"✗ Erro: {e}")
        return self.get_panel_data()

    def auto_posicionar(self):
        """Auto-posiciona componentes por categoria e retorna dados atualizados."""
        self._add_log("Auto-posicionando componentes...")
        try:
            self.app.auto_posicionar_componentes()
            self._add_log("✓ Componentes posicionados.")
        except Exception as e:
            self._add_log(f"✗ Erro: {e}")
        return self.get_panel_data()

    def gerar_rotas(self):
        """Executa algoritmo de roteamento e retorna dados atualizados."""
        self._add_log("Salvando config antes de rotear...")
        try:
            self.app._salvar_estado()
        except Exception as e:
            self._add_log(f"Aviso ao salvar: {e}")
        self._add_log("Calculando rotas...")
        try:
            self.app.gerar_rotas_todas()
            self._add_log(f"✓ {len(self.app.rota_atual)} segmentos de fio roteados.")
        except Exception as e:
            self._add_log(f"✗ Erro no roteamento: {e}")
        return self.get_panel_data()

    def gerar_saidas_oficiais(self):
        """Executa analisar_cad.py para gerar checklist, anilhas e relatório HTML."""
        if not self.app.cads_abertos:
            self._add_log("✗ Nenhum CAD aberto. Abra um arquivo primeiro.")
            return self.get_panel_data()

        # Project dir = where panel_api.py and analisar_cad.py live (always fixed)
        proj_dir  = Path(__file__).parent
        analisar  = proj_dir / "analisar_cad.py"

        # Output dir = subfolder named after the first CAD file (same as base_dir)
        out_dir = self.app.base_dir
        out_dir.mkdir(parents=True, exist_ok=True)
        self._add_log(f"Pasta de saída: {out_dir.name}/")

        self._add_log("Salvando config do painel...")
        try:
            self.app._salvar_estado()
        except Exception as e:
            self._add_log(f"Aviso: {e}")

        cmd = ([sys.executable, str(analisar), "auto", f"--outdir={out_dir}"]
               + [str(p) for p in self.app.cads_abertos])
        self._add_log(f"Executando analisar_cad.py...")
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(proj_dir))
            if r.returncode == 0:
                self._add_log(f"✓ checklist_montagem.html, anilhas.html e relatorio_cabeamento.html → {out_dir.name}/")
            else:
                self._add_log(f"✗ Erro: {r.stderr[:600]}")
        except Exception as e:
            self._add_log(f"✗ Falha: {e}")
        return self.get_panel_data()

    def move_component(self, nome, zona, linha, coluna):
        if nome not in self.app.componentes:
            return json.dumps({"error": f"Componente {nome} não encontrado"})
        self.app.componentes[nome]["zona"] = zona
        self.app.componentes[nome]["linha"] = int(linha)
        self.app.componentes[nome]["coluna"] = int(coluna)
        return self.get_panel_data()

    def move_component_xy(self, nome, cx, cy):
        """Atualiza posição de componente a partir do centro em coordenadas de canvas.
        Retorno rápido (sem get_panel_data) para não forçar re-render no drag."""
        if nome not in self.app.componentes:
            return json.dumps({"ok": False})
        gc = self.app.grid_config
        cx, cy = float(cx), float(cy)
        RS, CS = self.ROW_STEP, self.COL_STEP
        w_int = 60 + gc["interno"]["colunas"] * CS
        O_TMP_X = 50 + w_int + 80
        Y_EXT = self._y_ext_base()
        # First comp center: 80 + COMP_Y_OFF for interno/tampa; Y_EXT + COMP_Y_OFF for externo
        first_cy_int = 80 + self.COMP_Y_OFF
        first_cx_int = 50 + 30 + CS // 2   # = 50 + 30 + 65 = 145

        if cy >= Y_EXT and cx < O_TMP_X - 40:
            zona = "externo"
            lin = max(0, round((cy - (Y_EXT + self.COMP_Y_OFF)) / RS))
            col = max(0, round((cx - first_cx_int) / CS))
        elif cx >= O_TMP_X - 40:
            zona = "tampa"
            col = max(0, round((cx - (O_TMP_X + 30 + CS // 2)) / CS))
            lin = max(0, round((cy - first_cy_int) / RS))
        else:
            zona = "interno"
            col = max(0, round((cx - first_cx_int) / CS))
            lin = max(0, round((cy - first_cy_int) / RS))

        cfg = gc.get(zona, {"linhas": 1, "colunas": 1})
        lin = min(max(0, lin), cfg["linhas"] - 1)
        col = min(max(0, col), cfg["colunas"] - 1)

        self.app.componentes[nome]["zona"] = zona
        self.app.componentes[nome]["linha"] = lin
        self.app.componentes[nome]["coluna"] = col
        return json.dumps({"ok": True})

    def set_net_selecionada(self, idx):
        self.app.net_selecionada_idx = int(idx)
        return self.get_panel_data()

    def nova_net(self):
        self.app.nets.append({"nome": f"Net{len(self.app.nets)+1}", "terminais": [], "origem": None})
        return self.get_panel_data()

    def excluir_net(self, idx):
        idx = int(idx)
        if 0 <= idx < len(self.app.nets):
            del self.app.nets[idx]
            if self.app.net_selecionada_idx >= len(self.app.nets):
                self.app.net_selecionada_idx = -1
        return self.get_panel_data()

    def add_terminal_na_net(self, net_idx, terminal):
        net_idx = int(net_idx)
        if 0 <= net_idx < len(self.app.nets):
            if terminal not in self.app.nets[net_idx]["terminais"]:
                self.app.nets[net_idx]["terminais"].append(terminal)
        return self.get_panel_data()

    def remover_terminal_da_net(self, net_idx, terminal):
        net_idx = int(net_idx)
        if 0 <= net_idx < len(self.app.nets):
            try:
                self.app.nets[net_idx]["terminais"].remove(terminal)
            except ValueError:
                pass
        return self.get_panel_data()

    def get_log(self):
        return json.dumps(self._log)

    def clear_log(self):
        self._log.clear()
        return json.dumps([])

    def salvar_projeto(self):
        try:
            self.app._salvar_estado()
            self._add_log("✓ Projeto salvo em painel_config.json")
        except Exception as e:
            self._add_log(f"✗ Erro ao salvar: {e}")
        return self.get_panel_data()

    def set_component_properties(self, nome, props):
        """Armazena propriedades editáveis (voltagem, corrente, notas, etc.) no componente."""
        if nome not in self.app.componentes:
            return self.get_panel_data()
        self.app.componentes[nome]["propriedades"] = props if isinstance(props, dict) else {}
        try:
            self.app._salvar_estado()
        except Exception:
            pass
        return self.get_panel_data()

    def get_todos_terminais(self):
        """Retorna lista de todos os terminais disponíveis (comp:term)."""
        result = []
        for c_nome, c_data in self.app.componentes.items():
            for t_nome in c_data["terminais"].keys():
                result.append(f"{c_nome}:{t_nome}")
        return json.dumps(result)
