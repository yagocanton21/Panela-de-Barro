import { useState, useEffect } from "react";
import { Package, AlertTriangle, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom"; // Importante para a navegação

function Dashboard() {
    const [stats, setStats] = useState({ total: 0, alertas: 0 });
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/produtos")
            .then(res => res.json())
            .then(dados => {
                if (Array.isArray(dados)) {
                    setProdutos(dados);
                    // Usando 15 como limite para o teste
                    const lowStock = dados.filter(p => p.quantidade < 15).length;
                    setStats({ total: dados.length, alertas: lowStock });
                }
            })
            .catch(err => console.error("Falha na API", err));
    }, []);

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ color: "#c25e34", margin: 0 }}>Dashboard Panela de Barro</h1>
                    <p style={{ color: "#9da5ad", marginTop: "0.5rem" }}>Gestão de Estoque e Suprimentos</p>
                </div>

                {/* BOTÃO DE NAVEGAÇÃO PARA O CADASTRO */}
                <Link to="/cadastrar" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#c25e34",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "bold"
                }}>
                    <PlusCircle size={20} />
                    Novo Produto
                </Link>
            </header>

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
                            {/* Ajustado para < 15 para ficar igual ao contador lá de cima */}
                            <span style={{ color: p.quantidade < 15 ? "#f1c40f" : "#27ae60" }}>
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
