import { useState, useEffect } from "react";
import { ClipboardList, ArrowUpCircle, ArrowDownCircle, Info } from "lucide-react";

const ITENS_POR_PAGINA = 5;

function Historico() {
    const [todas, setTodas] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const headers = {
            "Authorization": `Bearer ${token}`
        };

        Promise.all([
            fetch("http://127.0.0.1:8000/movimentacoes", { headers }).then(r => r.json()),
            fetch("http://127.0.0.1:8000/produtos", { headers }).then(r => r.json())
        ]).then(([movs, prods]) => {
            if (Array.isArray(movs)) setTodas(movs);
            if (Array.isArray(prods)) setProdutos(prods);
        }).catch(err => console.error("Erro ao carregar histórico:", err));
    }, []);

    const getNomeProduto = (id) => {
        const p = produtos.find(prod => prod.id === id);
        return p ? p.nome : `Produto #${id}`;
    };

    const filtradas = filtro === "todos" ? todas : todas.filter(m => m.tipo === filtro);
    const totalPaginas = Math.ceil(filtradas.length / ITENS_POR_PAGINA);
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    const visiveis = filtradas.slice(inicio, inicio + ITENS_POR_PAGINA);

    const mudarFiltro = (novoFiltro) => {
        setFiltro(novoFiltro);
        setPagina(1);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                <div style={{
                    backgroundColor: 'var(--terracota)', padding: '12px', borderRadius: '12px',
                    color: 'white', display: 'flex', alignItems: 'center',
                    boxShadow: '0 4px 10px rgba(131, 62, 32, 0.2)'
                }}>
                    <ClipboardList size={28} />
                </div>
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Histórico de Movimentações
                </h1>
            </div>

            <div className="card" style={{ display: 'block', padding: '2rem' }}>
                {/* Filtros */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {["todos", "entrada", "saida"].map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => mudarFiltro(tipo)}
                            style={{
                                padding: '8px 20px', borderRadius: '20px', border: 'none',
                                cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                backgroundColor: filtro === tipo ? 'var(--terracota)' : '#f0ebe4',
                                color: filtro === tipo ? 'white' : '#9da5ad',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tipo === "todos" ? "Todos" : tipo === "entrada" ? "📈 Entradas" : "📉 Saídas"}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        {filtradas.length} registro(s)
                    </span>
                </div>

                {/* Lista */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {visiveis.length > 0 ? visiveis.map(mov => (
                        <div key={mov.id} style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            padding: '14px', borderRadius: '12px',
                            backgroundColor: '#fcfaf7', border: '1px solid var(--border-light)',
                            transition: 'box-shadow 0.2s'
                        }}>
                            <div style={{
                                color: mov.tipo === 'entrada' ? '#27ae60' : '#e74c3c',
                                backgroundColor: mov.tipo === 'entrada' ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                                padding: '10px', borderRadius: '10px', flexShrink: 0
                            }}>
                                {mov.tipo === 'entrada' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                                        {getNomeProduto(mov.produto_id)}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(mov.data_hora).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                                    <span style={{
                                        color: mov.tipo === 'entrada' ? '#27ae60' : '#e74c3c',
                                        fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px',
                                        backgroundColor: mov.tipo === 'entrada' ? 'rgba(39,174,96,0.06)' : 'rgba(231,76,60,0.06)'
                                    }}>
                                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Info size={13} /> {mov.motivo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Nenhuma movimentação encontrada.
                        </div>
                    )}
                </div>

                {/* Paginação */}
                {totalPaginas > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                            style={{
                                padding: '8px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                                backgroundColor: pagina === 1 ? '#f0ebe4' : 'white',
                                cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                                color: pagina === 1 ? '#c0b8b0' : 'var(--text-dark)'
                            }}
                        >← Anterior</button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setPagina(n)}
                                style={{
                                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                                    backgroundColor: pagina === n ? 'var(--terracota)' : '#f0ebe4',
                                    color: pagina === n ? 'white' : '#9da5ad',
                                    fontWeight: pagina === n ? 'bold' : 'normal',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >{n}</button>
                        ))}

                        <button
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={pagina === totalPaginas}
                            style={{
                                padding: '8px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                                backgroundColor: pagina === totalPaginas ? '#f0ebe4' : 'white',
                                cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                                color: pagina === totalPaginas ? '#c0b8b0' : 'var(--text-dark)'
                            }}
                        >Próxima →</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Historico;
