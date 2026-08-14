import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json

# ============================================================================
# MOTOR DO ALGORITMO (ROTEADOR INTELIGENTE)
# ============================================================================
CUSTO_MUDAR_ZONA = 50
CUSTO_FIO_EXTRA = 1000  # Penalidade progressiva para forçar distribuição

class RoteadorInteligente:
    def __init__(self, componentes, info_terminais, grid_config):
        self.componentes = componentes
        self.info_terminais = info_terminais
        self.grid_config = grid_config

    def _calcular_custo(self, u, v, graus):
        info_u = self.info_terminais[u]
        info_v = self.info_terminais[v]

        z_u = info_u['zona']
        z_v = info_v['zona']
        l_u = info_u['linha']
        c_u = info_u['coluna']
        l_v = info_v['linha']
        c_v = info_v['coluna']

        def dist_mesma_zona(zona, l1, c1, l2, c2):
            if l1 == l2:
                # Na mesma linha, os fios correm horizontalmente na mesma canaleta
                return abs(c1 - c2) * 10
            else:
                # Em linhas diferentes, precisam ir para a borda (canaleta vertical)
                max_col = self.grid_config[zona]['colunas'] - 1
                if zona == 'interno':
                    # Interno tem canaleta dos dois lados. Pega a rota mais curta.
                    dist_esq = (c1 * 10) + abs(l1 - l2) * 10 + (c2 * 10)
                    dist_dir = ((max_col - c1) * 10) + abs(l1 - l2) * 10 + ((max_col - c2) * 10)
                    return min(dist_esq, dist_dir)
                else:
                    # Tampa só tem canaleta na borda esquerda
                    return (c1 * 10) + abs(l1 - l2) * 10 + (c2 * 10)

        if z_u != z_v:
            # Se for entre Tampa e Interno, obrigatoriamente passa pela dobradiça (chicote)
            # O chicote fica no canto inferior direito do Painel (max_col, max_linha)
            # E entra no canto inferior esquerdo da Tampa (col 0, max_linha)
            
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
        if len(terminais_net) < 2:
            return [], 0, {}

        melhor_rota_global = []
        melhor_custo_global = float('inf')
        melhores_graus_global = {}

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
                    if graus[u] >= self.info_terminais[u]['limite']:
                        continue

                    for v in desconectados:
                        if graus[v] >= self.info_terminais[v]['limite']:
                            continue

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
                melhores_graus_global = dict(graus)

        if melhor_custo_global == float('inf'):
            return [], 0, {}

        return melhor_rota_global, melhor_custo_global, melhores_graus_global


# ============================================================================
# INTERFACE GRÁFICA (GUI) E GERENCIAMENTO DE ESTADO
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
        if comp_nome:
            self.e_nome.insert(0, comp_nome)
        self.e_nome.focus_set()
            
        ttk.Label(frame, text="Zona:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.cb_zona = ttk.Combobox(frame, values=["interno", "tampa"], state="readonly")
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
        
        scroll = ttk.Scrollbar(term_frame, command=self.list_term.yview)
        scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.list_term.config(yscrollcommand=scroll.set)
        
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
        if self.comp_nome_original:
            ttk.Button(btn_frame, text="Excluir", command=self.excluir).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancelar", command=self.destroy).pack(side=tk.LEFT, padx=5)
        
        frame.columnconfigure(1, weight=1)

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
        item = self.list_term.get(sel[0])
        t_nome = item.split(" ")[0]
        if t_nome in self.terminais:
            del self.terminais[t_nome]
        self._atualizar_lista_terminais()

    def salvar(self):
        nome = self.e_nome.get().strip().upper()
        if not nome:
            messagebox.showerror("Erro", "Nome do componente é obrigatório.")
            return
        
        zona = self.cb_zona.get()
        try:
            linha = int(self.e_linha.get().strip())
            coluna = int(self.e_coluna.get().strip())
            
            # Ajusta para o limite do grid
            if self.grid_cfg:
                linha = min(linha, self.grid_cfg[zona]["linhas"] - 1)
                coluna = min(coluna, self.grid_cfg[zona]["colunas"] - 1)
        except ValueError:
            messagebox.showerror("Erro", "Linha e coluna devem ser números inteiros.")
            return
            
        data = {
            "zona": zona,
            "linha": max(0, linha),
            "coluna": max(0, coluna),
            "terminais": self.terminais
        }
        
        self.on_save_callback(self.comp_nome_original, nome, data)
        self.destroy()

    def excluir(self):
        if messagebox.askyesno("Confirmar", f"Deseja realmente excluir o componente {self.comp_nome_original}?"):
            if self.on_delete_callback:
                self.on_delete_callback(self.comp_nome_original)
            self.destroy()


class SimuladorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Simulador de Roteamento - Design Avançado")
        self.root.geometry("1500x850")

        self.grid_config = {
            "interno": {"linhas": 4, "colunas": 6},
            "tampa": {"linhas": 4, "colunas": 4}
        }

        self.componentes = {} 
        self.nets = []
        self.net_selecionada_idx = -1
        self.rota_atual = []
        self.drag_data = {"item": None, "comp_nome": None, "start_x": 0, "start_y": 0}

        self.setup_ui()
        self.desenhar_painel()

    def setup_ui(self):
        style = ttk.Style()
        if "clam" in style.theme_names():
            style.theme_use('clam')
            
        menu_bar = tk.Menu(self.root)
        self.root.config(menu=menu_bar)
        
        arquivo_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="Arquivo", menu=arquivo_menu)
        arquivo_menu.add_command(label="Salvar Projeto", command=self.salvar_projeto)
        arquivo_menu.add_command(label="Carregar Projeto", command=self.carregar_projeto)
        arquivo_menu.add_separator()
        arquivo_menu.add_command(label="Sair", command=self.root.quit)
        
        # --- PAINEL ESQUERDO ---
        self.frame_esq = ttk.Frame(self.root, width=400, padding=10)
        self.frame_esq.pack(side=tk.LEFT, fill=tk.Y)
        
        # Configuração da Grade (NOVO)
        lf_grid = ttk.LabelFrame(self.frame_esq, text="Dimensões do Painel (Linhas x Colunas)", padding=5)
        lf_grid.pack(fill=tk.X, pady=(0,5))
        
        f_int = ttk.Frame(lf_grid)
        f_int.pack(fill=tk.X, pady=2)
        ttk.Label(f_int, text="Painel Interno: L ").pack(side=tk.LEFT)
        self.e_int_l = ttk.Entry(f_int, width=3); self.e_int_l.pack(side=tk.LEFT)
        self.e_int_l.insert(0, str(self.grid_config["interno"]["linhas"]))
        ttk.Label(f_int, text=" C ").pack(side=tk.LEFT)
        self.e_int_c = ttk.Entry(f_int, width=3); self.e_int_c.pack(side=tk.LEFT)
        self.e_int_c.insert(0, str(self.grid_config["interno"]["colunas"]))
        
        f_tmp = ttk.Frame(lf_grid)
        f_tmp.pack(fill=tk.X, pady=2)
        ttk.Label(f_tmp, text="Porta (Tampa): L ").pack(side=tk.LEFT)
        self.e_tmp_l = ttk.Entry(f_tmp, width=3); self.e_tmp_l.pack(side=tk.LEFT)
        self.e_tmp_l.insert(0, str(self.grid_config["tampa"]["linhas"]))
        ttk.Label(f_tmp, text=" C ").pack(side=tk.LEFT)
        self.e_tmp_c = ttk.Entry(f_tmp, width=3); self.e_tmp_c.pack(side=tk.LEFT)
        self.e_tmp_c.insert(0, str(self.grid_config["tampa"]["colunas"]))
        
        ttk.Button(lf_grid, text="Aplicar Novo Tamanho", command=self.atualizar_grid).pack(fill=tk.X, pady=2)

        # Componentes
        lf_comp = ttk.LabelFrame(self.frame_esq, text="Componentes", padding=5)
        lf_comp.pack(fill=tk.X, pady=5)
        ttk.Button(lf_comp, text="Criar Componente", command=self.novo_componente).pack(fill=tk.X)
        
        # Redes
        lf_net = ttk.LabelFrame(self.frame_esq, text="Redes (Mesmo Potencial)", padding=5)
        lf_net.pack(fill=tk.BOTH, expand=True, pady=5)
        
        btn_frame_net = ttk.Frame(lf_net)
        btn_frame_net.pack(fill=tk.X)
        ttk.Button(btn_frame_net, text="Nova Rede", command=self.nova_net).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=1)
        ttk.Button(btn_frame_net, text="Excluir Rede", command=self.excluir_net).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=1)
        
        self.list_nets = tk.Listbox(lf_net, height=4, exportselection=False)
        self.list_nets.pack(fill=tk.BOTH, expand=True, pady=2)
        self.list_nets.bind('<<ListboxSelect>>', self.on_net_select)
        
        # Add to net
        add_comp_net_frame = ttk.Frame(lf_net)
        add_comp_net_frame.pack(fill=tk.X, pady=1)
        self.cb_comp_disp = ttk.Combobox(add_comp_net_frame, state="readonly", width=10)
        self.cb_comp_disp.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0,2))
        ttk.Button(add_comp_net_frame, text="+ Todo o Componente", command=self.add_comp_na_net).pack(side=tk.RIGHT)
        
        add_term_net_frame = ttk.Frame(lf_net)
        add_term_net_frame.pack(fill=tk.X, pady=1)
        self.cb_term_disp = ttk.Combobox(add_term_net_frame, state="readonly", width=10)
        self.cb_term_disp.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0,2))
        ttk.Button(add_term_net_frame, text="+ Terminal Específico", command=self.add_term_na_net).pack(side=tk.RIGHT)
        
        # Ponto de Partida
        ttk.Label(lf_net, text="Ponto de Partida (Deixe em branco p/ IA decidir):").pack(anchor=tk.W, pady=(5,0))
        self.cb_origem_net = ttk.Combobox(lf_net, state="readonly")
        self.cb_origem_net.pack(fill=tk.X)
        self.cb_origem_net.bind("<<ComboboxSelected>>", self.on_origem_select)
        
        # Terminais atuais
        self.list_term_net = tk.Listbox(lf_net, height=4, selectmode=tk.EXTENDED)
        self.list_term_net.pack(fill=tk.BOTH, expand=True, pady=2)
        ttk.Button(lf_net, text="Remover Selecionados", command=self.remover_term_da_net).pack(fill=tk.X)
        
        # AÇÃO PRINCIPAL
        ttk.Button(self.frame_esq, text="ROTEAR FIOS (GERAR CANALETAS)", command=self.gerar_rotas_todas).pack(fill=tk.X, pady=10)
        
        # Log
        self.log_text = tk.Text(self.frame_esq, height=10, state=tk.DISABLED, bg="#1e1e1e", fg="#00ff00", font=("Consolas", 8))
        self.log_text.pack(fill=tk.BOTH, expand=True)

        # --- PAINEL DIREITO (CANVAS) ---
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

    def atualizar_grid(self):
        try:
            self.grid_config["interno"]["linhas"] = max(1, int(self.e_int_l.get()))
            self.grid_config["interno"]["colunas"] = max(1, int(self.e_int_c.get()))
            self.grid_config["tampa"]["linhas"] = max(1, int(self.e_tmp_l.get()))
            self.grid_config["tampa"]["colunas"] = max(1, int(self.e_tmp_c.get()))
            self.desenhar_painel()
        except ValueError:
            messagebox.showerror("Erro", "Dimensões devem ser números inteiros.")

    def salvar_projeto(self):
        path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("Arquivos JSON", "*.json")])
        if path:
            dados = {
                "grid_config": self.grid_config,
                "componentes": self.componentes,
                "nets": self.nets
            }
            with open(path, "w", encoding="utf-8") as f:
                json.dump(dados, f, indent=4)
            messagebox.showinfo("Sucesso", "Projeto salvo!")

    def carregar_projeto(self):
        path = filedialog.askopenfilename(filetypes=[("Arquivos JSON", "*.json")])
        if path:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    dados = json.load(f)
                
                if "grid_config" in dados:
                    self.grid_config = dados["grid_config"]
                    self.e_int_l.delete(0, tk.END); self.e_int_l.insert(0, str(self.grid_config["interno"]["linhas"]))
                    self.e_int_c.delete(0, tk.END); self.e_int_c.insert(0, str(self.grid_config["interno"]["colunas"]))
                    self.e_tmp_l.delete(0, tk.END); self.e_tmp_l.insert(0, str(self.grid_config["tampa"]["linhas"]))
                    self.e_tmp_c.delete(0, tk.END); self.e_tmp_c.insert(0, str(self.grid_config["tampa"]["colunas"]))
                    
                self.componentes = dados.get("componentes", {})
                nets_carregadas = dados.get("nets", [])
                
                # Migração de versões antigas do formato de Nets
                self.nets = []
                if nets_carregadas:
                    if isinstance(nets_carregadas[0], str):
                        # Versão super antiga: apenas uma lista de strings
                        self.nets = [{"terminais": nets_carregadas, "origem": None}]
                    elif isinstance(nets_carregadas[0], list):
                        # Versão do meio: lista de listas
                        self.nets = [{"terminais": n, "origem": None} for n in nets_carregadas]
                    else:
                        # Versão atual: lista de dicionários
                        self.nets = nets_carregadas

                self.net_selecionada_idx = -1
                self.rota_atual = []
                self.atualizar_ui_dependente()
                self.atualizar_lista_nets()
                self.list_term_net.delete(0, tk.END)
                self.cb_origem_net.set('')
                self.cb_origem_net['values'] = []
                
                self.log_text.config(state=tk.NORMAL)
                self.log_text.delete(1.0, tk.END)
                self.log_text.config(state=tk.DISABLED)
                
                messagebox.showinfo("Sucesso", "Projeto carregado com sucesso!")
            except Exception as e:
                messagebox.showerror("Erro ao Carregar", f"Ocorreu um erro ao ler o arquivo:\n{str(e)}")

    def novo_componente(self):
        ComponentEditor(self.root, None, {}, self.salvar_componente, grid_cfg=self.grid_config)

    def editar_componente(self, comp_nome):
        if comp_nome in self.componentes:
            ComponentEditor(self.root, comp_nome, self.componentes[comp_nome], self.salvar_componente, self.excluir_componente, grid_cfg=self.grid_config)

    def salvar_componente(self, old_nome, new_nome, data):
        if old_nome and old_nome != new_nome:
            if new_nome in self.componentes:
                messagebox.showerror("Erro", "Nome já existe.")
                return
            del self.componentes[old_nome]
            for net_dict in self.nets:
                for i in range(len(net_dict["terminais"])):
                    if net_dict["terminais"][i].startswith(old_nome + ":"):
                        net_dict["terminais"][i] = new_nome + ":" + net_dict["terminais"][i].split(":")[1]
                if net_dict.get("origem") and net_dict["origem"].startswith(old_nome + ":"):
                    net_dict["origem"] = new_nome + ":" + net_dict["origem"].split(":")[1]
        
        self.componentes[new_nome] = data
        self.atualizar_ui_dependente()

    def excluir_componente(self, comp_nome):
        del self.componentes[comp_nome]
        for net_dict in self.nets:
            net_dict["terminais"] = [t for t in net_dict["terminais"] if not t.startswith(comp_nome + ":")]
            if net_dict.get("origem") and net_dict["origem"].startswith(comp_nome + ":"):
                net_dict["origem"] = None
        self.atualizar_ui_dependente()

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
            self.list_term_net.delete(0, tk.END)
            self.cb_origem_net.set('')
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
        self.desenhar_painel()

    def add_term_na_net(self):
        if self.net_selecionada_idx < 0: return
        term = self.cb_term_disp.get()
        if term and term not in self.nets[self.net_selecionada_idx]["terminais"]:
            self.nets[self.net_selecionada_idx]["terminais"].append(term)
            self.on_net_select(None) # atualiza ui

    def add_comp_na_net(self):
        if self.net_selecionada_idx < 0: return
        comp = self.cb_comp_disp.get()
        if comp in self.componentes:
            for t_nome in self.componentes[comp]["terminais"].keys():
                term = f"{comp}:{t_nome}"
                if term not in self.nets[self.net_selecionada_idx]["terminais"]:
                    self.nets[self.net_selecionada_idx]["terminais"].append(term)
            self.on_net_select(None)

    def add_todos_terminais_na_net(self):
        if self.net_selecionada_idx < 0: return
        for c_nome, c_data in self.componentes.items():
            for t_nome in c_data["terminais"].keys():
                term = f"{c_nome}:{t_nome}"
                if term not in self.nets[self.net_selecionada_idx]["terminais"]:
                    self.nets[self.net_selecionada_idx]["terminais"].append(term)
        self.on_net_select(None)

    def remover_term_da_net(self):
        if self.net_selecionada_idx < 0: return
        sel = self.list_term_net.curselection()
        if sel:
            for idx in reversed(sel):
                t_rem = self.nets[self.net_selecionada_idx]["terminais"][idx]
                del self.nets[self.net_selecionada_idx]["terminais"][idx]
                if self.nets[self.net_selecionada_idx].get("origem") == t_rem:
                    self.nets[self.net_selecionada_idx]["origem"] = None
            self.on_net_select(None)

    def gerar_rotas_todas(self):
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete(1.0, tk.END)
        self.log_text.config(state=tk.DISABLED)
        self.rota_atual = []
        
        for i, net_dict in enumerate(self.nets):
            net = net_dict["terminais"]
            origem_forcada = net_dict.get("origem")
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

            roteador = RoteadorInteligente(self.componentes, info_terminais, self.grid_config)
            terminais_validos = [t for t in net if t in info_terminais]
            rota, custo, graus = roteador.rotear(terminais_validos, origem_forcada=origem_forcada)

            if not rota:
                self.print_log(f"\n--- REDE {i+1} --- IMPOSSÍVEL ROTEAR!")
            else:
                self.print_log(f"\n--- REDE {i+1} --- Custo Total: {custo}")
                for passo, (u, v) in enumerate(rota, 1):
                    self.print_log(f"  [{passo}] {u} -> {v}")
                    self.rota_atual.append((i, u, v))
                
        self.desenhar_painel()

    # --- DESENHO / FÍSICA / CANALETAS ---
    def get_duct_y(self, zona, linha):
        # A canaleta passa LOGO ABAIXO da linha de componentes
        CELL_H, CANALETA_H = 100, 30
        offset_y = 80
        return offset_y + CANALETA_H + linha * (CELL_H + CANALETA_H) + CELL_H + (CANALETA_H / 2)

    def get_vert_duct_x(self, zona, side):
        # Posição X do centro da canaleta vertical
        CELL_W, CANALETA_W = 100, 30
        int_c = self.grid_config["interno"]["colunas"]
        W_INT = (CANALETA_W * 2) + (int_c * CELL_W)
        
        OFFSET_INT_X = 50
        OFFSET_TMP_X = OFFSET_INT_X + W_INT + 80
        
        if zona == "interno":
            if side == 'left': return OFFSET_INT_X + (CANALETA_W / 2)
            else: return OFFSET_INT_X + W_INT - (CANALETA_W / 2)
        else:
            return OFFSET_TMP_X + (CANALETA_W / 2) # Tampa só tem na esquerda

    def get_best_vert_x(self, zona, ux, vx):
        if zona == 'tampa': return self.get_vert_duct_x('tampa', 'left')
        x_left = self.get_vert_duct_x('interno', 'left')
        x_right = self.get_vert_duct_x('interno', 'right')
        return x_left if (abs(ux - x_left) + abs(vx - x_left)) < (abs(ux - x_right) + abs(vx - x_right)) else x_right

    def get_grid_coords(self, zona, linha, coluna):
        CELL_W, CELL_H, CANALETA_W, CANALETA_H = 100, 100, 30, 30
        int_c = self.grid_config["interno"]["colunas"]
        W_INT = (CANALETA_W * 2) + (int_c * CELL_W)
        OFFSET_INT_X, OFFSET_INT_Y = 50, 80
        OFFSET_TMP_X, OFFSET_TMP_Y = OFFSET_INT_X + W_INT + 80, 80
        
        cx = OFFSET_INT_X if zona == "interno" else OFFSET_TMP_X
        cy = OFFSET_INT_Y if zona == "interno" else OFFSET_TMP_Y
        
        cx += CANALETA_W + (coluna * CELL_W) + (CELL_W / 2)
        cy += CANALETA_H + (linha * (CELL_H + CANALETA_H)) + (CELL_H / 2)
        return cx, cy

    def resolver_posicao_mouse(self, x, y):
        CELL_W, CELL_H, CANALETA_W, CANALETA_H = 100, 100, 30, 30
        int_c = self.grid_config["interno"]["colunas"]
        W_INT = (CANALETA_W * 2) + (int_c * CELL_W)
        OFFSET_INT_X, OFFSET_INT_Y = 50, 80
        OFFSET_TMP_X, OFFSET_TMP_Y = OFFSET_INT_X + W_INT + 80, 80
        
        if x > OFFSET_TMP_X - 40:
            zona = "tampa"
            col = round((x - OFFSET_TMP_X - CANALETA_W - (CELL_W/2)) / CELL_W)
            lin = round((y - OFFSET_TMP_Y - CANALETA_H - (CELL_H/2)) / (CELL_H + CANALETA_H))
            col = max(0, min(col, self.grid_config["tampa"]["colunas"] - 1))
            lin = max(0, min(lin, self.grid_config["tampa"]["linhas"] - 1))
        else:
            zona = "interno"
            col = round((x - OFFSET_INT_X - CANALETA_W - (CELL_W/2)) / CELL_W)
            lin = round((y - OFFSET_INT_Y - CANALETA_H - (CELL_H/2)) / (CELL_H + CANALETA_H))
            col = max(0, min(col, self.grid_config["interno"]["colunas"] - 1))
            lin = max(0, min(lin, self.grid_config["interno"]["linhas"] - 1))
        return zona, lin, col

    def desenhar_painel(self):
        self.canvas.delete("all")
        
        CELL_W, CELL_H, CANALETA_W, CANALETA_H = 100, 100, 30, 30
        int_l, int_c = self.grid_config["interno"]["linhas"], self.grid_config["interno"]["colunas"]
        tmp_l, tmp_c = self.grid_config["tampa"]["linhas"], self.grid_config["tampa"]["colunas"]
        
        W_INT = (CANALETA_W * 2) + (int_c * CELL_W)
        H_INT = (CANALETA_H * (int_l + 1)) + (int_l * CELL_H)
        W_TMP = CANALETA_W + (tmp_c * CELL_W)
        H_TMP = (CANALETA_H * (tmp_l + 1)) + (tmp_l * CELL_H)
        
        OFFSET_INT_X, OFFSET_INT_Y = 50, 80
        OFFSET_TMP_X, OFFSET_TMP_Y = OFFSET_INT_X + W_INT + 80, 80
        
        # Placas de fundo
        self.canvas.create_rectangle(OFFSET_INT_X-20, OFFSET_INT_Y-40, OFFSET_INT_X+W_INT+20, OFFSET_INT_Y+H_INT+20, fill="#b5b5b5", outline="#777", width=2)
        self.canvas.create_text(OFFSET_INT_X, OFFSET_INT_Y-25, text="CHAPA DE MONTAGEM (INTERNO)", font=("Arial", 11, "bold"), anchor="w", fill="#333")

        self.canvas.create_rectangle(OFFSET_TMP_X-20, OFFSET_TMP_Y-40, OFFSET_TMP_X+W_TMP+20, OFFSET_TMP_Y+H_TMP+20, fill="#c9c9c9", outline="#777", width=2)
        self.canvas.create_text(OFFSET_TMP_X, OFFSET_TMP_Y-25, text="PORTA DO PAINEL (TAMPA)", font=("Arial", 11, "bold"), anchor="w", fill="#333")

        # Desenhar Canaletas (Dutos cinza escuro)
        cor_canal = "#383838"
        
        # Canaletas verticais Interno (esquerda e direita)
        self.canvas.create_rectangle(OFFSET_INT_X, OFFSET_INT_Y, OFFSET_INT_X+CANALETA_W, OFFSET_INT_Y+H_INT, fill=cor_canal, outline="#222")
        self.canvas.create_rectangle(OFFSET_INT_X+W_INT-CANALETA_W, OFFSET_INT_Y, OFFSET_INT_X+W_INT, OFFSET_INT_Y+H_INT, fill=cor_canal, outline="#222")
        
        # Canaletas horizontais Interno
        for l in range(int_l + 1):
            y = OFFSET_INT_Y + l * (CELL_H + CANALETA_H)
            self.canvas.create_rectangle(OFFSET_INT_X+CANALETA_W, y, OFFSET_INT_X+W_INT-CANALETA_W, y+CANALETA_H, fill=cor_canal, outline="#222")

        # Canaleta vertical Tampa (só na esquerda)
        self.canvas.create_rectangle(OFFSET_TMP_X, OFFSET_TMP_Y, OFFSET_TMP_X+CANALETA_W, OFFSET_TMP_Y+H_TMP, fill=cor_canal, outline="#222")
        
        # Canaletas horizontais Tampa
        for l in range(tmp_l + 1):
            y = OFFSET_TMP_Y + l * (CELL_H + CANALETA_H)
            self.canvas.create_rectangle(OFFSET_TMP_X+CANALETA_W, y, OFFSET_TMP_X+W_TMP, y+CANALETA_H, fill=cor_canal, outline="#222")

        # Desenhar o Chicote Físico (dobradiça)
        dobradica_int_x = OFFSET_INT_X + W_INT - CANALETA_W/2
        dobradica_int_y = OFFSET_INT_Y + H_INT
        dobradica_tmp_x = OFFSET_TMP_X + CANALETA_W/2
        dobradica_tmp_y = OFFSET_TMP_Y + H_TMP
        
        self.canvas.create_line(dobradica_int_x, dobradica_int_y, dobradica_int_x, dobradica_int_y+50, dobradica_tmp_x, dobradica_tmp_y+50, dobradica_tmp_x, dobradica_tmp_y, fill="#111", width=16, smooth=True, capstyle=tk.ROUND)
        self.canvas.create_line(dobradica_int_x, dobradica_int_y, dobradica_int_x, dobradica_int_y+50, dobradica_tmp_x, dobradica_tmp_y+50, dobradica_tmp_x, dobradica_tmp_y, fill="#444", width=12, smooth=True, capstyle=tk.ROUND)

        coords_terminais = {}
        
        # Desenhar Componentes Redesenhados
        for comp_nome, info in self.componentes.items():
            cx, cy = self.get_grid_coords(info["zona"], info["linha"], info["coluna"])
            qtd_term = len(info["terminais"])
            w = max(60, qtd_term * 20 + 10)
            h = 60
            x1, y1 = cx - w/2, cy - h/2
            x2, y2 = cx + w/2, cy + h/2

            em_net = False
            if self.net_selecionada_idx >= 0 and self.net_selecionada_idx < len(self.nets):
                em_net = any(t.startswith(comp_nome+":") for t in self.nets[self.net_selecionada_idx]["terminais"])

            tag = f"comp_{comp_nome}"
            self.canvas.create_rectangle(x1+4, y1+4, x2+4, y2+4, fill="#1a1a1a", outline="", tags=(tag,)) # Sombra
            self.canvas.create_rectangle(x1, y1, x2, y2, fill="#9bc4e2" if em_net else "#ddd", outline="#222", width=2, tags=(tag,))
            self.canvas.create_rectangle(x1+5, y1+5, x2-5, y2-20, fill="#f2f2f2", outline="#aaa", tags=(tag,)) # Face
            self.canvas.create_text(cx, cy-8, text=comp_nome, font=("Segoe UI", 10, "bold"), fill="#222", tags=(tag,))

            step = w / (qtd_term + 1) if qtd_term > 0 else 0
            for i, term_nome in enumerate(info["terminais"].keys()):
                tx = x1 + (step * (i + 1))
                ty = y2 - 10
                coords_terminais[f"{comp_nome}:{term_nome}"] = (tx, ty)
                
                # Parafuso realista
                self.canvas.create_oval(tx-4, ty-4, tx+4, ty+4, fill="#d4d4d4", outline="#555", tags=(tag,))
                self.canvas.create_line(tx-2, ty-2, tx+2, ty+2, fill="#777", tags=(tag,))
                self.canvas.create_text(tx, ty-14, text=term_nome, font=("Arial", 7, "bold"), fill="#111", tags=(tag,))

        # Desenhar Roteamento Físico dentro das Canaletas
        cores_nets = ["#00ffcc", "#ff3366", "#ffff00", "#ff9900", "#cc33ff", "#33ccff"]
        
        for net_idx, u, v in self.rota_atual:
            if u in coords_terminais and v in coords_terminais:
                ux, uy = coords_terminais[u]
                vx, vy = coords_terminais[v]

                zona_u, l_u = self.componentes[u.split(':')[0]]["zona"], self.componentes[u.split(':')[0]]["linha"]
                zona_v, l_v = self.componentes[v.split(':')[0]]["zona"], self.componentes[v.split(':')[0]]["linha"]
                
                cor_fio = cores_nets[net_idx % len(cores_nets)]
                jitter = (net_idx % 5 - 2) * 4 # Desloca o fio levemente para nao sobrepor outros da mesma net
                
                y_duct_u = self.get_duct_y(zona_u, l_u) + jitter
                y_duct_v = self.get_duct_y(zona_v, l_v) + jitter

                path = [(ux, uy), (ux, y_duct_u)]

                if zona_u == zona_v:
                    if l_u == l_v:
                        path.append((vx, y_duct_u))
                    else:
                        x_vert = self.get_best_vert_x(zona_u, ux, vx) + jitter
                        path.append((x_vert, y_duct_u))
                        path.append((x_vert, y_duct_v))
                        path.append((vx, y_duct_v))
                else:
                    # Passagem pelo Chicote (Dobradiça)
                    x_vert_u = self.get_vert_duct_x(zona_u, 'right' if zona_u == 'interno' else 'left') + jitter
                    y_bottom_u = self.get_duct_y(zona_u, self.grid_config[zona_u]["linhas"] - 1) + jitter
                    
                    x_vert_v = self.get_vert_duct_x(zona_v, 'right' if zona_v == 'interno' else 'left') + jitter
                    y_bottom_v = self.get_duct_y(zona_v, self.grid_config[zona_v]["linhas"] - 1) + jitter
                    
                    path.append((x_vert_u, y_duct_u))
                    path.append((x_vert_u, y_bottom_u))
                    # Curva do chicote por baixo do painel
                    path.append((x_vert_u, dobradica_int_y + 25 + jitter))
                    path.append((x_vert_v, dobradica_tmp_y + 25 + jitter))
                    path.append((x_vert_v, y_bottom_v))
                    path.append((x_vert_v, y_duct_v))
                    path.append((vx, y_duct_v))
                
                path.append((vx, vy))
                
                # Renderiza a linha do fio segmentada ortogonalmente
                for p in range(len(path)-1):
                    x1, y1 = path[p]
                    x2, y2 = path[p+1]
                    # Seta só na ponta final
                    arrow = tk.LAST if p == len(path)-2 else tk.NONE
                    self.canvas.create_line(x1, y1, x2, y2, fill=cor_fio, width=2.5, arrow=arrow)

    # --- DRAG & DROP E CLIQUE DUPLO ---
    def on_double_click(self, event):
        item = self.canvas.find_withtag("current")
        if not item: return
        for tag in self.canvas.gettags(item[0]):
            if tag.startswith("comp_"):
                self.editar_componente(tag[5:])
                break

    def on_drag_start(self, event):
        item = self.canvas.find_withtag("current")
        if not item: return
        for tag in self.canvas.gettags(item[0]):
            if tag.startswith("comp_"):
                self.drag_data = {"item": tag, "comp_nome": tag[5:], "start_x": event.x, "start_y": event.y}
                break

    def on_drag_motion(self, event):
        if self.drag_data["item"]:
            self.canvas.move(self.drag_data["item"], event.x - self.drag_data["start_x"], event.y - self.drag_data["start_y"])
            self.drag_data["start_x"], self.drag_data["start_y"] = event.x, event.y

    def on_drag_release(self, event):
        if self.drag_data["comp_nome"]:
            comp = self.drag_data["comp_nome"]
            zona, lin, col = self.resolver_posicao_mouse(event.x, event.y)
            self.componentes[comp]["zona"], self.componentes[comp]["linha"], self.componentes[comp]["coluna"] = zona, lin, col
            self.drag_data = {"item": None, "comp_nome": None, "start_x": 0, "start_y": 0}
            self.desenhar_painel()

if __name__ == "__main__":
    root = tk.Tk()
    app = SimuladorApp(root)
    root.mainloop()
