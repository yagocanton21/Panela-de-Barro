import { Check, Trash2, Package } from "lucide-react";
import { useState, useEffect } from "react";

// Card individual de item da lista de compras
const ItemListaCard = ({ item, onToggle, onRemove }) => {
    const comprado = item.comprado;
    const nome = item.nome_produto || item.nome_avulso || "Item sem nome";
    const [quantidade, setQuantidade] = useState(item.quantidade);

    useEffect(() => {
        setQuantidade(item.quantidade);
    }, [item.quantidade]);

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            border: `1px solid ${comprado ? '#e8e0d5' : '#f0ece6'}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.3s ease',
            opacity: comprado ? 0.6 : 1,
        }}>
            {/* Checkbox visual */}
            <button
                onClick={() => {
                    const qtdFinal = parseInt(quantidade) || 1;
                    onToggle(item.id, !comprado, qtdFinal);
                }}
                title={comprado ? "Desmarcar" : "Marcar como comprado"}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    border: comprado ? 'none' : '2px solid #d4cfc7',
                    backgroundColor: comprado ? '#27ae60' : 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                }}
            >
                {comprado && <Check size={18} />}
            </button>

            {/* Info do item */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: comprado ? 'var(--text-muted)' : 'var(--text-dark)',
                    textDecoration: comprado ? 'line-through' : 'none',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {nome}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {!comprado ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Qtd:</span>
                            <input
                                type="number"
                                min="1"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value === '' ? '' : parseInt(e.target.value))}
                                style={{
                                    width: '50px',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid #d4cfc7',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '0.8rem',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                    ) : (
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            fontWeight: '500',
                        }}>
                            Qtd: {item.quantidade}
                        </span>
                    )}
                    {item.produto_id && (
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--terracota)',
                            backgroundColor: 'rgba(131, 62, 32, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '20px',
                        }}>
                            <Package size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                            Vinculado ao estoque
                        </span>
                    )}
                </div>
            </div>

            {/* Botão remover */}
            <button
                onClick={() => onRemove(item.id)}
                title="Remover da lista"
                style={{
                    background: '#f8f9fa',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#7d7569',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#faeaea'; e.currentTarget.style.color = '#e74c3c'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = '#7d7569'; }}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

export default ItemListaCard;
