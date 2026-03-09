import { useState, useEffect } from "react";
import { Package, Search, Filter, AlertTriangle, Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Estoque() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 8;

    useEffect(() => {
        fetchDados();
    }, []);

    const fetchDados = async () => {
        setLoading(true);
        try {
            const [resProdutos, resCategorias] = await Promise.all([
                fetch("http://127.0.0.1:8000/produtos"),
                fetch("http://127.0.0.1:8000/categorias")
            ]);

            const dadosProdutos = await resProdutos.json();
            const dadosCategorias = await resCategorias.json();

            // Garantimos que dadosProdutos seja um array, mesmo se a API retornar erro/vazio
            setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
            setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            setProdutos([]);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtragem corrigida usando categoria_id
    const produtosFiltrados = produtos.filter(p => {
        const matchesBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
        const matchesCategoria = categoriaFiltro === "todas" || p.categoria_id === parseInt(categoriaFiltro);
        return matchesBusca && matchesCategoria;
    });

    // Resetar página se os filtros mudarem
    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, categoriaFiltro]);

    // Paginação lógica
    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
    const startIndex = (paginaAtual - 1) * itensPorPagina;
    const produtosPaginados = produtosFiltrados.slice(startIndex, startIndex + itensPorPagina);

    const getStatusStyle = (qtd) => {
        if (qtd <= 0) return { color: '#e74c3c', label: 'Esgotado', bg: 'rgba(231, 76, 60, 0.1)' };
        if (qtd < 10) return { color: '#f1c40f', label: 'Estoque Baixo', bg: 'rgba(241, 196, 15, 0.1)' };
        return { color: '#27ae60', label: 'Normal', bg: 'rgba(39, 174, 96, 0.1)' };
    };

    const handleExcluir = async (id) => {
        if (window.confirm("Deseja realmente excluir este produto?")) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/produtos/${id}`, { method: "DELETE" });
                if (response.ok) {
                    fetchDados();
                } else {
                    alert("Erro ao excluir produto.");
                }
            } catch (err) {
                console.error("Erro ao excluir", err);
                alert("Erro de conexão com o servidor.");
            }
        }
    };

    const handleEditar = (id) => {
        navigate(`/editar/${id}`);
    };

    return (
        <div style={{ textAlign: "left" }}>
            {/* Cabeçalho de Título */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Package size={36} color="var(--terracota)" />
                        Inventário
                    </h1>
                </div>
                <button
                    onClick={() => navigate("/cadastrar")}
                    style={{
                        backgroundColor: 'var(--terracota)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 8px 15px rgba(131, 62, 32, 0.2)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} /> Adicionar Produto
                </button>
            </div>

            {/* Barra de Busca e Filtro - Redesenhada para evitar conflitos de estilo */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '2.5rem',
                backgroundColor: 'white',
                padding: '1.2rem',
                borderRadius: '24px',
                border: '1px solid var(--border-light)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
                <div style={{ position: 'relative', flex: 2 }}>
                    <Search size={20} color="#9da5ad" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Busque pelo nome..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 45px',
                            borderRadius: '15px',
                            border: '1px solid #eee',
                            backgroundColor: '#f9f9f9',
                            fontSize: '0.95rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <Filter size={20} color="#9da5ad" />
                    <select
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '15px',
                            border: '1px solid #eee',
                            backgroundColor: '#f9f9f9',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    >
                        <option value="todas">Todas Categorias</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grade de Cards */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="spinner"></div> Carregando estoque...
                </div>
            ) : produtosFiltrados.length > 0 ? (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '20px'
                    }}>
                        {produtosPaginados.map((p) => {
                            const status = getStatusStyle(p.quantidade);

                            return (
                                <div key={p.id} className="inventory-card" style={{
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    padding: '1.2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #f0ece6',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'default'
                                }}>
                                    {/* Efeito de Fundo Decorativo */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        right: '-20px',
                                        width: '100px',
                                        height: '100px',
                                        background: `radial-gradient(circle, ${status.color}15 0%, transparent 70%)`,
                                        borderRadius: '50%',
                                        zIndex: 0
                                    }}></div>

                                    {/* Cabeçalho do Card: Categoria e Status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', zIndex: 1 }}>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: 'var(--terracota)',
                                            backgroundColor: 'rgba(131, 62, 32, 0.08)',
                                            padding: '4px 10px',
                                            borderRadius: '20px'
                                        }}>
                                            {p.categoria || 'Sem Categoria'}
                                        </span>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: status.bg,
                                            padding: '4px 10px',
                                            borderRadius: '20px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', backgroundColor: status.color, borderRadius: '50%' }}></div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: status.color }}>{status.label}</span>
                                        </div>
                                    </div>

                                    {/* Conteúdo Central */}
                                    <div style={{ flex: 1, marginBottom: '1rem', zIndex: 1 }}>
                                        <h3 style={{
                                            margin: '0 0 6px 0',
                                            fontSize: '1.1rem',
                                            color: 'var(--text-dark)',
                                            fontWeight: '700',
                                            lineHeight: '1.2'
                                        }}>
                                            {p.nome}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                                                {p.quantidade}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                {p.unidade_medida} em estoque
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rodapé com Ações */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderTop: '1px solid #f5f0e6',
                                        paddingTop: '0.8rem',
                                        zIndex: 1
                                    }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEditar(p.id)}
                                                style={{
                                                    background: '#f8f9fa',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#7d7569',
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eef0f2'; e.currentTarget.style.color = 'var(--terracota)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = '#7d7569'; }}
                                                title="Editar Produto"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(p.id)}
                                                style={{
                                                    background: '#f8f9fa',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#7d7569',
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#faeaea'; e.currentTarget.style.color = '#e74c3c'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = '#7d7569'; }}
                                                title="Excluir Produto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => navigate("/movimentacoes")}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--terracota)',
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(131, 62, 32, 0.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Movimentar →
                                        </button>
                                    </div>

                                    <style>{`
                                    .inventory-card:hover {
                                        transform: translateY(-10px) scale(1.02);
                                        border-color: var(--terracota);
                                        box-shadow: 0 20px 40px rgba(131, 62, 32, 0.1);
                                    }
                                `}</style>
                                </div>
                            );
                        })}
                    </div>

                    {/* Controles de Paginação */}
                    {totalPaginas > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '20px',
                            marginTop: '2.5rem',
                            padding: '1rem',
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            border: '1px solid var(--border-light)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                        }}>
                            <button
                                disabled={paginaAtual === 1}
                                onClick={() => setPaginaAtual(prev => prev - 1)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: paginaAtual === 1 ? '#f5f5f5' : '#f8f9fa',
                                    color: paginaAtual === 1 ? '#adb5bd' : 'var(--terracota)',
                                    cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronLeft size={18} /> Anterior
                            </button>

                            <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                                Página {paginaAtual} de {totalPaginas}
                            </span>

                            <button
                                disabled={paginaAtual === totalPaginas}
                                onClick={() => setPaginaAtual(prev => prev + 1)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: paginaAtual === totalPaginas ? '#f5f5f5' : '#f8f9fa',
                                    color: paginaAtual === totalPaginas ? '#adb5bd' : 'var(--terracota)',
                                    cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Próxima <ChevronRight size={18} />
                            </button>
                        </div>
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
