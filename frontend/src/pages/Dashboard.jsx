import { useState, useEffect } from "react";
import { Package, AlertTriangle } from "lucide-react";

function Dashboard() {
    const [stats, setStats] = useState({ total: 0, alertas: 0 });
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/produtos")

            .then(res => res.json())
            .then(dados => {
                if (Array.isArray(dados)) {
                    setProdutos(dados);
                    const lowStock = dados.filter(p => p.quantidade < 10).length;
                    setStats({ total: dados.length, alertas: lowStock });
                }
            })
            .catch(err => console.error("Falha na API", err));
    }, []);

    return (
        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
            <h1>Dashboard Panela de Barro</h1>

            <div className="stats-grid">
                <div className="card" style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    gap: '20px',
                    padding: '1.8rem',
                    border: '1px solid #f0ece6',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
                    borderRadius: '24px'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(131, 62, 32, 0.08)',
                        padding: '18px',
                        borderRadius: '20px',
                        color: 'var(--terracota)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <span style={{ fontSize: "2rem", fontWeight: "900", color: 'var(--text-dark)', display: "block", lineHeight: 1 }}>{stats.total}</span>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: '600' }}>Produtos em Inventário</span>
                    </div>
                </div>

                <div className="card" style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    gap: '20px',
                    padding: '1.8rem',
                    border: '1px solid #f0ece6',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
                    borderRadius: '24px'
                }}>
                    <div style={{
                        backgroundColor: stats.alertas > 0 ? 'rgba(241, 196, 15, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                        padding: '18px',
                        borderRadius: '20px',
                        color: stats.alertas > 0 ? "#f1c40f" : "#27ae60",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <span style={{ fontSize: "2rem", fontWeight: "900", color: 'var(--text-dark)', display: "block", lineHeight: 1 }}>{stats.alertas}</span>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: '600' }}>Alertas Críticos</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ display: "block", textAlign: "left" }}>
                <h3 style={{ marginTop: 0, marginBottom: "1.5rem", borderBottom: "1px solid #3e4246", paddingBottom: "0.5rem" }}>Lista de Inventário</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {produtos.length > 0 ? produtos.map(p => (
                        <li key={p.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.05)"
                        }}>
                            <span style={{ fontWeight: 500 }}>{p.nome}</span>
                            <span style={{ fontWeight: 600, color: p.quantidade <= 0 ? "#e74c3c" : p.quantidade < 10 ? "#f1c40f" : "#27ae60" }}>
                                {p.quantidade} {p.unidade_medida}
                            </span>
                        </li>
                    )) : <li style={{ color: "#9da5ad" }}>Nenhum produto cadastrado.</li>}
                </ul>
            </div>
        </div>
    );
}

export default Dashboard;
