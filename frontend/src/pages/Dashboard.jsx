import { useState, useEffect } from "react";
import { Package, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, alertas: 0, totalValor: 0 });
    const [produtos, setProdutos] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);

    useEffect(() => {
        // Fetch Produtos
        fetch("http://127.0.0.1:8000/produtos")
            .then(res => res.json())
            .then(dados => {
                if (Array.isArray(dados)) {
                    setProdutos(dados);
                    // Usando quantidade minima para alertar
                    const lowStock = dados.filter(p => p.quantidade <= (p.quantidade_minima ?? 5)).length;

                    const valorEstimado = dados.reduce((acc, p) => acc + (p.quantidade * (p.preco_unitario || 0)), 0);
                    setStats({ total: dados.length, alertas: lowStock, totalValor: valorEstimado });
                }
            })
            .catch(err => console.error("Falha na API", err));

        // Movimentações
        fetch("http://127.0.0.1:8000/movimentacoes")
            .then(res => res.json())
            .then(dados => {
                console.log("DADOS BRUTOS DA API:", dados); // DEPURAÇÃO
                if (Array.isArray(dados)) {
                    // Pega as 5 ultimas movimentações
                    setMovimentacoes(dados.slice(0, 5));
                }
            })
            .catch(err => console.error("Falha na API Movimentacoes", err));
    }, []);

    return (
        <div style={{ paddingBottom: "3rem", textAlign: "left", maxWidth: "1000px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>

            {/* Header Clean */}
            <div style={{ marginBottom: '3rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1.5rem' }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "600", color: '#111', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                    Visão Geral
                </h1>
                <p style={{ color: "#666", margin: 0, fontSize: "0.95rem", fontWeight: "400" }}>
                    Acompanhamento do estoque do Panela de Barro
                </p>
            </div>

            {/* Métricas Minimalistas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '3rem'
            }}>
                {/* Métricas Total */}
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#fff',
                    border: '1px solid #eaeaea',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <Package size={18} strokeWidth={2} />
                        <span style={{ fontSize: "0.85rem", fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total de Itens
                        </span>
                    </div>
                    <div>
                        <span style={{ fontSize: "2.5rem", fontWeight: "600", color: '#111', lineHeight: 1 }}>
                            {stats.total}
                        </span>
                    </div>
                </div>

                {/* Métricas Alerta */}
                <div
                    onClick={() => navigate("/estoque", { state: { filterLowStock: true } })}
                    style={{
                        padding: '1.5rem',
                        backgroundColor: '#fff',
                        border: '1px solid #eaeaea',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#d93025'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#eaeaea'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <AlertCircle size={18} strokeWidth={2} color={stats.alertas > 0 ? '#d93025' : '#666'} />
                        <span style={{ fontSize: "0.85rem", fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', color: stats.alertas > 0 ? '#d93025' : '#666' }}>
                            Itens em Baixa
                        </span>
                    </div>
                    <div>
                        <span style={{ fontSize: "2.5rem", fontWeight: "600", color: stats.alertas > 0 ? '#d93025' : '#111', lineHeight: 1 }}>
                            {stats.alertas}
                        </span>
                        {stats.alertas > 0 && <span style={{ fontSize: '0.85rem', color: '#d93025', marginLeft: '8px' }}>requer reposição</span>}
                    </div>
                </div>
            </div>

            {/* View das Ultimas Movimentacoes Clean */}
            <div style={{
                backgroundColor: '#fff',
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeaea', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#111" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: '#111' }}>Últimas Atividades</h3>
                </div>

                <div style={{ padding: '0 1.5rem' }}>
                    {movimentacoes.length > 0 ? movimentacoes.map((mov, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.2rem 0',
                            borderBottom: index === movimentacoes.length - 1 ? 'none' : '1px solid #eaeaea'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: mov.tipo === 'entrada' ? '#e6f4ea' : '#fce8e6',
                                    color: mov.tipo === 'entrada' ? '#137333' : '#d93025',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {mov.tipo === 'entrada' ? <ArrowDownRight size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <span style={{ fontWeight: '500', color: '#111', display: 'block', marginBottom: '4px', fontSize: '1.05rem' }}>
                                        {mov.produto_nome || `Produto #${mov.produto_id}`}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{mov.motivo}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    fontWeight: '600',
                                    fontSize: '1.1rem',
                                    color: mov.tipo === 'entrada' ? '#137333' : '#d93025',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>
                                    {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                    {new Date(mov.data_hora).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                            Nenhuma movimentação registrada.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Dashboard;
