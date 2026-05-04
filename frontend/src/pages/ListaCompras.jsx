import { useState, useEffect } from "react";
import { ShoppingCart, Plus, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { apiRequest } from "../api";
import ItemListaCard from "../components/ItemListaCard";
import ModalAdicionarItem from "../components/ModalAdicionarItem";

// --- Componente Principal ---
function ListaCompras() {
    const [itens, setItens] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sincronizando, setSincronizando] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [filtro, setFiltro] = useState("todos"); // "todos", "pendentes", "comprados"
    const [mensagem, setMensagem] = useState(null);

    useEffect(() => {
        fetchDados();
    }, []);

    // Limpa mensagens de feedback após 4 segundos
    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => setMensagem(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    const fetchDados = async () => {
        setLoading(true);
        try {
            const [resItens, resProdutos] = await Promise.all([
                apiRequest("/lista-compras/"),
                apiRequest("/produtos"),
            ]);

            if (resItens) {
                const dados = await resItens.json();
                setItens(Array.isArray(dados) ? dados : []);
            }
            if (resProdutos) {
                const dados = await resProdutos.json();
                setProdutos(Array.isArray(dados) ? dados : []);
            }
        } catch (error) {
            console.error("Erro ao carregar lista:", error);
            setItens([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSincronizar = async () => {
        setSincronizando(true);
        try {
            const res = await apiRequest("/lista-compras/sincronizar", { method: "POST" });
            if (res && res.ok) {
                const data = await res.json();
                setMensagem({ tipo: "sucesso", texto: data.message });
                fetchDados();
            } else {
                setMensagem({ tipo: "erro", texto: "Erro ao sincronizar." });
            }
        } catch {
            setMensagem({ tipo: "erro", texto: "Falha na conexão com o servidor." });
        } finally {
            setSincronizando(false);
        }
    };

    const handleAdicionarItem = async (dados) => {
        try {
            const res = await apiRequest("/lista-compras/", {
                method: "POST",
                body: JSON.stringify(dados),
            });
            if (res && res.ok) {
                setMensagem({ tipo: "sucesso", texto: "Item adicionado com sucesso!" });
                setModalAberto(false);
                fetchDados();
            } else {
                const err = await res?.json();
                setMensagem({ tipo: "erro", texto: err?.detail || "Erro ao adicionar item." });
            }
        } catch {
            setMensagem({ tipo: "erro", texto: "Falha na conexão com o servidor." });
        }
    };

    const handleToggleComprado = async (id, comprado, quantidade) => {
        try {
            const res = await apiRequest(`/lista-compras/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ comprado, quantidade }),
            });
            
            if (res && res.ok) {
                setMensagem(null);
                fetchDados();
            }
        } catch {
            setMensagem({ tipo: "erro", texto: "Erro ao atualizar status." });
        }
    };

    const handleFinalizarCompras = async () => {
        if (!window.confirm("Deseja dar entrada no estoque e remover os itens comprados?")) return;
        try {
            setLoading(true);
            const res = await apiRequest("/lista-compras/finalizar", { method: "POST" });
            if (res && res.ok) {
                const data = await res.json();
                setMensagem({ tipo: "sucesso", texto: data.message });
                fetchDados();
            } else {
                const err = await res?.json();
                setMensagem({ tipo: "erro", texto: err?.detail || "Erro ao finalizar." });
                setLoading(false);
            }
        } catch {
            setMensagem({ tipo: "erro", texto: "Falha na conexão com o servidor." });
            setLoading(false);
        }
    };

    const handleRemover = async (id) => {
        if (!window.confirm("Deseja remover este item da lista?")) return;
        try {
            const res = await apiRequest(`/lista-compras/${id}`, { method: "DELETE" });
            if (res && res.ok) {
                setMensagem({ tipo: "sucesso", texto: "Item removido." });
                fetchDados();
            }
        } catch {
            setMensagem({ tipo: "erro", texto: "Erro ao remover item." });
        }
    };

    // Filtro de itens
    const itensFiltrados = itens.filter(item => {
        if (filtro === "pendentes") return !item.comprado;
        if (filtro === "comprados") return item.comprado;
        return true;
    });

    const totalPendentes = itens.filter(i => !i.comprado).length;
    const totalComprados = itens.filter(i => i.comprado).length;

    return (
        <div style={{ textAlign: "left" }}>
            {/* Header */}
            <div className="lista-header">
                <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ShoppingCart size={36} color="var(--terracota)" /> Lista de Compras
                </h1>
                <div className="lista-actions-container">
                    {totalComprados > 0 && (
                        <button
                            onClick={handleFinalizarCompras}
                            style={{
                                backgroundColor: '#27ae60', color: 'white', border: 'none',
                                padding: '10px 20px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                                boxShadow: '0 8px 15px rgba(39, 174, 96, 0.2)'
                            }}
                        >
                            <Check size={18} /> Finalizar Compras
                        </button>
                    )}
                    <button
                        onClick={handleSincronizar}
                        disabled={sincronizando}
                        style={{
                            backgroundColor: 'white', color: 'var(--terracota)', border: '2px solid var(--terracota)',
                            padding: '10px 20px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                            opacity: sincronizando ? 0.6 : 1,
                        }}
                    >
                        <RefreshCw size={18} style={{ animation: sincronizando ? 'spin 1s linear infinite' : 'none' }} />
                        {sincronizando ? "Sincronizando..." : "Sincronizar Estoque"}
                    </button>

                    <button
                        onClick={() => setModalAberto(true)}
                        style={{
                            backgroundColor: 'var(--terracota)', color: 'white', border: 'none',
                            padding: '10px 20px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 8px 15px rgba(131, 62, 32, 0.2)', transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={18} /> Adicionar Item
                    </button>
                </div>
            </div>

            {/* Mensagem de feedback */}
            {mensagem && (
                <div style={{
                    marginBottom: '1.5rem', padding: '12px 20px', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', gap: '10px', animation: 'fadeIn 0.3s ease',
                    backgroundColor: mensagem.tipo === "sucesso" ? '#f0faf4' : '#fef7f7',
                    border: `1px solid ${mensagem.tipo === "sucesso" ? '#c6f0d6' : '#fce8e6'}`,
                    color: mensagem.tipo === "sucesso" ? '#1a7f37' : '#d93025',
                }}>
                    {mensagem.tipo === "sucesso" ? <Check size={18} /> : <AlertTriangle size={18} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{mensagem.texto}</span>
                </div>
            )}

            {/* Cards de resumo */}
            <div className="lista-stats-grid">
                <div className="card" style={{ alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Total de Itens
                    </span>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                        {itens.length}
                    </span>
                </div>
                <div className="card" style={{ alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#f39c12' }}>
                        Pendentes
                    </span>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: '#f39c12' }}>
                        {totalPendentes}
                    </span>
                </div>
                <div className="card" style={{ alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#27ae60' }}>
                        Comprados
                    </span>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: '#27ae60' }}>
                        {totalComprados}
                    </span>
                </div>
            </div>

            {/* Filtros por tabs */}
            <div className="lista-tabs">
                {[
                    { key: "todos", label: `Todos (${itens.length})` },
                    { key: "pendentes", label: `Pendentes (${totalPendentes})` },
                    { key: "comprados", label: `Comprados (${totalComprados})` },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFiltro(tab.key)}
                        style={{
                            padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s',
                            backgroundColor: filtro === tab.key ? 'var(--terracota)' : 'transparent',
                            color: filtro === tab.key ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Lista de Itens */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Carregando lista de compras...
                </div>
            ) : itensFiltrados.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {itensFiltrados.map(item => (
                        <ItemListaCard
                            key={item.id}
                            item={item}
                            onToggle={handleToggleComprado}
                            onRemove={handleRemover}
                        />
                    ))}
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white', padding: '60px', textAlign: 'center',
                    borderRadius: '24px', border: '1px solid var(--border-light)',
                }}>
                    <ShoppingCart size={48} color="var(--border-light)" style={{ marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
                        {filtro === "todos"
                            ? "Sua lista de compras está vazia. Adicione itens ou sincronize com o estoque!"
                            : "Nenhum item encontrado neste filtro."}
                    </p>
                </div>
            )}

            {/* Modal de Adicionar */}
            <ModalAdicionarItem
                aberto={modalAberto}
                onClose={() => setModalAberto(false)}
                onSubmit={handleAdicionarItem}
                produtos={produtos}
            />

            {/* Animação de spin para o botão de sincronizar */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default ListaCompras;
