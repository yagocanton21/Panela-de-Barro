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
                    const lowStock = dados.filter(p => p.quantidade < 15).length;
                    setStats({ total: dados.length, alertas: lowStock });
                }
            })
            .catch(err => console.error("Falha na API", err));
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Dashboard Panela de Barro</h1>

            <div className="stats-grid">
                <div className="card">
                    <Package size={28} color="#c25e34" />
                    <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "1.5rem", fontWeight: "bold", display: "block" }}>{stats.total}</span>
                        <span style={{ fontSize: "0.85rem", color: "#9da5ad" }}>Produtos Totais</span>
                    </div>
                </div>
                <div className="card">
                    <AlertTriangle size={28} color={stats.alertas > 0 ? "#f1c40f" : "#27ae60"} />
                    <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "1.5rem", fontWeight: "bold", display: "block" }}>{stats.alertas}</span>
                        <span style={{ fontSize: "0.85rem", color: "#9da5ad" }}>Alertas de Estoque</span>
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
                            <span style={{ color: p.quantidade < 5 ? "#f1c40f" : "#27ae60" }}>
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
