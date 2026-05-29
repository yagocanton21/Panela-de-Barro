import { useState, useEffect, useCallback } from "react";
import { ClipboardList, ArrowUpCircle, ArrowDownCircle, Info, User, Search, X } from "lucide-react";
import { apiRequest } from "../api";

const ITENS_POR_PAGINA = 10;

function Historico() {
    const [todas, setTodas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [carregando, setCarregando] = useState(false);

    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroUsuario, setFiltroUsuario] = useState("");
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");

    const carregarMovimentacoes = useCallback(async (pg = 1) => {
        setCarregando(true);
        setTodas([]); // limpa imediatamente para não mostrar dados velhos
        const offset = (pg - 1) * ITENS_POR_PAGINA;
        const params = new URLSearchParams();
        params.set("limit", ITENS_POR_PAGINA);
        params.set("offset", offset);
        if (filtroTipo) params.set("tipo", filtroTipo);
        if (filtroUsuario) params.set("usuario_id", filtroUsuario);
        if (filtroDataInicio) params.set("data_inicio", filtroDataInicio + "T00:00:00");
        if (filtroDataFim) params.set("data_fim", filtroDataFim + "T23:59:59");

        try {
            const r = await apiRequest(`/movimentacoes?${params.toString()}`);
            if (!r) { setCarregando(false); return; }
            const data = await r.json();
            if (Array.isArray(data)) {
                setTodas(data);
                if (data.length < ITENS_POR_PAGINA) {
                    setTotal(offset + data.length);
                } else {
                    setTotal(offset + data.length + 1);
                }
            } else {
                setTodas([]);
                setTotal(0);
            }
        } catch (err) {
            console.error("Erro ao carregar histórico:", err);
            setTodas([]);
            setTotal(0);
        } finally {
            setCarregando(false);
        }
    }, [filtroTipo, filtroUsuario, filtroDataInicio, filtroDataFim]);

    useEffect(() => {
        // Carrega lista de usuários para o dropdown
        apiRequest("/usuarios")
            .then(r => r && r.json())
            .then(data => { if (Array.isArray(data)) setUsuarios(data); })
            .catch(() => {}); // silencia erro se não for admin
    }, []);

    useEffect(() => {
        setPagina(1);
        carregarMovimentacoes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroTipo, filtroUsuario, filtroDataInicio, filtroDataFim]);

    const mudarPagina = (pg) => {
        setPagina(pg);
        carregarMovimentacoes(pg);
    };

    const limparFiltros = () => {
        setFiltroTipo("");
        setFiltroUsuario("");
        setFiltroDataInicio("");
        setFiltroDataFim("");
    };

    const temFiltros = filtroTipo || filtroUsuario || filtroDataInicio || filtroDataFim;
    const totalPaginas = Math.ceil(total / ITENS_POR_PAGINA);

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
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.4rem', fontWeight: 'bold' }}>
                    Histórico de Movimentações
                </h1>
            </div>

            <div className="card" style={{ display: 'block', padding: '1.5rem' }}>
                {/* Filtros */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                    {/* Linha 1: tipo */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {["", "entrada", "saida"].map(tipo => (
                            <button
                                key={tipo}
                                onClick={() => setFiltroTipo(tipo)}
                                style={{
                                    padding: '8px 20px', borderRadius: '20px', border: 'none',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                    backgroundColor: filtroTipo === tipo ? 'var(--terracota)' : '#f0ebe4',
                                    color: filtroTipo === tipo ? 'white' : '#9da5ad',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tipo === "" ? "Todos" : tipo === "entrada" ? "📈 Entradas" : "📉 Saídas"}
                            </button>
                        ))}

                        {temFiltros && (
                            <button
                                onClick={limparFiltros}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '8px 14px', borderRadius: '20px', border: 'none',
                                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600',
                                    backgroundColor: 'rgba(231,76,60,0.1)', color: '#e74c3c',
                                    marginLeft: 'auto'
                                }}
                            >
                                <X size={13} /> Limpar filtros
                            </button>
                        )}
                    </div>

                    {/* Linha 2: usuário + datas */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {usuarios.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} style={{ color: 'var(--text-muted)' }} />
                                <select
                                    value={filtroUsuario}
                                    onChange={e => setFiltroUsuario(e.target.value)}
                                    style={{
                                        padding: '7px 12px', borderRadius: '8px', fontSize: '0.85rem',
                                        border: '1px solid var(--border-light)', backgroundColor: filtroUsuario ? 'var(--terracota)' : 'white',
                                        color: filtroUsuario ? 'white' : 'var(--text-dark)', cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Todos os usuários</option>
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>{u.nome_exibicao}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Search size={14} style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                value={filtroDataInicio}
                                onChange={e => setFiltroDataInicio(e.target.value)}
                                style={{
                                    padding: '7px 10px', borderRadius: '8px', fontSize: '0.85rem',
                                    border: `1px solid ${filtroDataInicio ? 'var(--terracota)' : 'var(--border-light)'}`,
                                    outline: 'none', color: 'var(--text-dark)'
                                }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>até</span>
                            <input
                                type="date"
                                value={filtroDataFim}
                                onChange={e => setFiltroDataFim(e.target.value)}
                                style={{
                                    padding: '7px 10px', borderRadius: '8px', fontSize: '0.85rem',
                                    border: `1px solid ${filtroDataFim ? 'var(--terracota)' : 'var(--border-light)'}`,
                                    outline: 'none', color: 'var(--text-dark)'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lista */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {carregando ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Carregando...
                        </div>
                    ) : todas.length > 0 ? todas.map(mov => (
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                                        {mov.produto_nome || `Produto #${mov.produto_id}`}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(mov.data_hora).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        color: mov.tipo === 'entrada' ? '#27ae60' : '#e74c3c',
                                        fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px',
                                        backgroundColor: mov.tipo === 'entrada' ? 'rgba(39,174,96,0.06)' : 'rgba(231,76,60,0.06)'
                                    }}>
                                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                                    </span>
                                    {mov.motivo && (
                                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Info size={13} /> {mov.motivo}
                                        </span>
                                    )}
                                    {mov.usuario_nome && (
                                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={13} /> {mov.usuario_nome}
                                        </span>
                                    )}
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
                            onClick={() => mudarPagina(pagina - 1)}
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
                                onClick={() => mudarPagina(n)}
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
                            onClick={() => mudarPagina(pagina + 1)}
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
