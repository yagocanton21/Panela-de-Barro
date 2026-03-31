import { useState, useEffect } from "react";
import { Package, Search, Filter, AlertTriangle, Edit2, Trash2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// --- Subcomponentes para limpar o código principal ---

const ProductCard = ({ p, status, onEdit, onDelete, onMove }) => (
    <div className="inventory-card" style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '1.2rem',
        display: 'flex', flexDirection: 'column', border: '1px solid #f0ece6',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)', transition: 'all 0.4s ease',
        position: 'relative', overflow: 'hidden', cursor: 'default'
    }}>
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: `radial-gradient(circle, ${status.color}15 0%, transparent 70%)`, zIndex: 0
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', zIndex: 1 }}>
            <span style={{
                fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                color: 'var(--terracota)', backgroundColor: 'rgba(131, 62, 32, 0.08)',
                padding: '4px 10px', borderRadius: '20px'
            }}>
                {p.categoria || 'Sem Categoria'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: status.bg, padding: '4px 10px', borderRadius: '20px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: status.color, borderRadius: '50%' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: status.color }}>{status.label}</span>
            </div>
        </div>

        <div style={{ flex: 1, marginBottom: '1rem', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '700' }}>{p.nome}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>{p.quantidade}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{p.unidade_medida} em estoque</span>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f0e6', paddingTop: '0.8rem', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onEdit(p.id)} className="action-btn" title="Editar Produto"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(p.id)} className="action-btn delete" title="Excluir Produto"><Trash2 size={16} /></button>
            </div>
            <button onClick={onMove} className="move-btn">Movimentar →</button>
        </div>

        <style>{`
            .inventory-card:hover { transform: translateY(-10px) scale(1.02); border-color: var(--terracota); box-shadow: 0 20px 40px rgba(131, 62, 32, 0.1); }
            .action-btn { background: #f8f9fa; border: none; cursor: pointer; color: #7d7569; padding: 8px; borderRadius: 10px; display: flex; transition: all 0.2s; border-radius: 10px; }
            .action-btn:hover { background-color: #eef0f2; color: var(--terracota); }
            .action-btn.delete:hover { background-color: #faeaea; color: #e74c3c; }
            .move-btn { background: none; border: none; color: var(--terracota); font-size: 0.85rem; font-weight: 700; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
            .move-btn:hover { background-color: rgba(131, 62, 32, 0.05); }
        `}</style>
    </div>
);

const Pagination = ({ current, total, onPrev, onNext }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '2.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '20px', border: '1px solid var(--border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <button disabled={current === 1} onClick={onPrev} className="page-btn"><ChevronLeft size={18} /> Anterior</button>
        <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Página {current} de {total}</span>
        <button disabled={current === total} onClick={onNext} className="page-btn">Próxima <ChevronRight size={18} /></button>
        <style>{`
            .page-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: none; background-color: #f8f9fa; color: var(--terracota); cursor: pointer; font-weight: bold; transition: all 0.2s; }
            .page-btn:disabled { background-color: #f5f5f5; color: #adb5bd; cursor: not-allowed; }
            .page-btn:not(:disabled):hover { background-color: #eef0f2; }
        `}</style>
    </div>
);

// --- Componente Principal ---

function Estoque() {
    const navigate = useNavigate();
    const location = useLocation();
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [somenteBaixoEstoque, setSomenteBaixoEstoque] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    useEffect(() => { 
        fetchDados(); 
        // Verifica se veio do dashboard com o filtro ativado
        if (location.state && location.state.filterLowStock) {
            setSomenteBaixoEstoque(true);
        }
    }, [location]);

    useEffect(() => { setPaginaAtual(1); }, [busca, categoriaFiltro, somenteBaixoEstoque]);

    const fetchDados = async () => {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        try {
            const [resProdutos, resCategorias] = await Promise.all([
                fetch("http://127.0.0.1:8000/produtos", { headers }),
                fetch("http://127.0.0.1:8000/categorias", { headers })
            ]);
            const dadosProdutos = await resProdutos.json();
            const dadosCategorias = await resCategorias.json();

            setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
            setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            setProdutos([]);
        } finally {
            setLoading(false);
        }
    };

    const produtosFiltrados = produtos.filter(p => {
        const matchesBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
        const matchesCategoria = categoriaFiltro === "todas" || p.categoria_id === parseInt(categoriaFiltro);
        
        // Agora o filtro de estoque baixo usa a quantidade_minima customizada
        const isLowStock = p.quantidade <= (p.quantidade_minima ?? 5);
        const matchesBaixoEstoque = !somenteBaixoEstoque || isLowStock;
        
        return matchesBusca && matchesCategoria && matchesBaixoEstoque;
    });

    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
    const startIndex = (paginaAtual - 1) * itensPorPagina;
    const produtosPaginados = produtosFiltrados.slice(startIndex, startIndex + itensPorPagina);

    const getStatusStyle = (p) => {
        const qtd = p.quantidade;
        const min = p.quantidade_minima ?? 5;

        if (qtd <= 0) return { color: '#e74c3c', label: 'Esgotado', bg: 'rgba(231, 76, 60, 0.1)' };
        if (qtd <= min) return { color: '#f1c40f', label: 'Estoque Baixo', bg: 'rgba(241, 196, 15, 0.1)' };
        return { color: '#27ae60', label: 'Normal', bg: 'rgba(39, 174, 96, 0.1)' };
    };

    const handleExcluir = async (id) => {
        if (window.confirm("Deseja realmente excluir este produto?")) {
            const token = localStorage.getItem("access_token");
            try {
                const response = await fetch(`http://127.0.0.1:8000/produtos/${id}`, { 
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.ok) fetchDados();
                else alert("Erro ao excluir produto.");
            } catch (err) {
                alert("Erro de conexão com o servidor.");
            }
        }
    };

    return (
        <div style={{ textAlign: "left" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Package size={36} color="var(--terracota)" /> Inventário
                </h1>
                <button
                    onClick={() => navigate("/cadastrar")}
                    className="add-btn"
                    style={{ backgroundColor: 'var(--terracota)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 15px rgba(131, 62, 32, 0.2)', transition: 'transform 0.2s' }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} /> Adicionar Produto
                </button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '2.5rem', backgroundColor: 'white', padding: '1.2rem', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ position: 'relative', flex: 2 }}>
                    <Search size={20} color="#9da5ad" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Busque pelo nome..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '15px', border: '1px solid #eee', backgroundColor: '#f9f9f9', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <Filter size={20} color="#9da5ad" />
                    <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid #eee', backgroundColor: '#f9f9f9', cursor: 'pointer', fontSize: '0.95rem', outline: 'none' }}>
                        <option value="todas">Todas Categorias</option>
                        {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                    </select>
                </div>
                {(busca || categoriaFiltro !== "todas" || somenteBaixoEstoque) && (
                    <button 
                        onClick={() => {
                            setBusca("");
                            setCategoriaFiltro("todas");
                            setSomenteBaixoEstoque(false);
                            // Limpa o estado da navegação para não reativar o filtro ao recarregar
                            window.history.replaceState({}, document.title);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '15px', border: '1px solid #fce8e6', backgroundColor: '#fff', color: '#d93025', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                    >
                        <X size={16} /> Limpar
                    </button>
                )}
            </div>

            {/* Banner de Filtro Ativo (Opcional) */}
            {somenteBaixoEstoque && (
                <div style={{ marginBottom: '1.5rem', padding: '10px 20px', backgroundColor: '#fef7f7', borderRadius: '12px', border: '1px solid #fce8e6', display: 'flex', alignItems: 'center', gap: '10px', color: '#d93025' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Exibindo apenas produtos com estoque baixo (menos de 10 unidades).</span>
                </div>
            )}

            {/* Conteúdo */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}><div className="spinner"></div> Carregando estoque...</div>
            ) : produtosFiltrados.length > 0 ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                        {produtosPaginados.map(p => (
                            <ProductCard 
                                key={p.id} 
                                p={p} 
                                status={getStatusStyle(p)} 
                                onEdit={id => navigate(`/editar/${id}`)} 
                                onDelete={handleExcluir} 
                                onMove={() => navigate("/movimentacoes")} 
                            />
                        ))}
                    </div>

                    {totalPaginas > 1 && (
                        <Pagination 
                            current={paginaAtual} 
                            total={totalPaginas} 
                            onPrev={() => setPaginaAtual(prev => prev - 1)} 
                            onNext={() => setPaginaAtual(prev => prev + 1)} 
                        />
                    )}
                </>
            ) : (
                <div style={{ backgroundColor: 'white', padding: '60px', textAlign: 'center', borderRadius: '32px', border: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Nenhum produto encontrado.</p>
                </div>
            )}
        </div>
    );
}

export default Estoque;
