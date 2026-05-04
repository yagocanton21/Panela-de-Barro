import { useState } from "react";
import { X } from "lucide-react";

// Modal para adicionar item à lista de compras (avulso ou do estoque)
const ModalAdicionarItem = ({ aberto, onClose, onSubmit, produtos }) => {
    const [tipo, setTipo] = useState("avulso"); // "avulso" ou "produto"
    const [nomeAvulso, setNomeAvulso] = useState("");
    const [produtoId, setProdutoId] = useState("");
    const [quantidade, setQuantidade] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        const qtdFinal = parseInt(quantidade) || 1;
        const dados = { quantidade: qtdFinal };
        if (tipo === "avulso") {
            dados.nome_avulso = nomeAvulso;
        } else {
            dados.produto_id = parseInt(produtoId);
        }
        onSubmit(dados);
        // Reseta o formulário
        setNomeAvulso("");
        setProdutoId("");
        setQuantidade(1);
        setTipo("avulso");
    };

    if (!aberto) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
        }}>
            <div style={{
                background: 'white', borderRadius: '24px', padding: '2rem',
                width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                animation: 'fadeIn 0.2s ease',
                maxHeight: '90vh', overflowY: 'auto',
            }}>
                {/* Header do Modal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Adicionar Item</h2>
                    <button onClick={onClose} style={{
                        background: '#f8f9fa', border: 'none', cursor: 'pointer',
                        padding: '8px', borderRadius: '10px', color: '#7d7569', display: 'flex',
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Seletor de tipo */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setTipo("avulso")}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s',
                            backgroundColor: tipo === "avulso" ? 'var(--terracota)' : '#f5f0e6',
                            color: tipo === "avulso" ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        Item Avulso
                    </button>
                    <button
                        onClick={() => setTipo("produto")}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s',
                            backgroundColor: tipo === "produto" ? 'var(--terracota)' : '#f5f0e6',
                            color: tipo === "produto" ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        Do Estoque
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit}>
                    {tipo === "avulso" ? (
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Nome do Item</label>
                            <input
                                type="text"
                                value={nomeAvulso}
                                onChange={(e) => setNomeAvulso(e.target.value)}
                                placeholder="Ex: Leite, Pão..."
                                required
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '15px',
                                    border: '1px solid #eee', backgroundColor: '#f9f9f9',
                                    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Produto do Estoque</label>
                            <select
                                value={produtoId}
                                onChange={(e) => setProdutoId(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '15px',
                                    border: '1px solid #eee', backgroundColor: '#f9f9f9',
                                    fontSize: '0.95rem', outline: 'none', cursor: 'pointer',
                                }}
                            >
                                <option value="">Selecione um produto...</option>
                                {produtos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidade})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Quantidade</label>
                        <input
                            type="number"
                            min="1"
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value === '' ? '' : parseInt(e.target.value))}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '15px',
                                border: '1px solid #eee', backgroundColor: '#f9f9f9',
                                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
                        backgroundColor: 'var(--terracota)', color: 'white', fontWeight: 'bold',
                        fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 8px 15px rgba(131, 62, 32, 0.2)',
                    }}>
                        Adicionar à Lista
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalAdicionarItem;
