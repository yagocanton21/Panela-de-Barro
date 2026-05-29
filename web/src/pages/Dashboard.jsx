import { useState, useEffect, useMemo } from "react";
import {
    Package,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

const COLORS = {
    text: "#111",
    muted: "#666",
    subtle: "#888",
    border: "#eaeaea",
    bg: "#fff",
    bgSoft: "#fafafa",
    green: "#137333",
    greenSoft: "#e6f4ea",
    red: "#d93025",
    redSoft: "#fce8e6",
};

function saudacao() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
}

function MetricCard({ icon: Icon, label, value, hint, accent, onClick }) {
    const interativo = typeof onClick === "function";
    return (
        <div
            onClick={onClick}
            style={{
                padding: "1.6rem 1.8rem",
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                cursor: interativo ? "pointer" : "default",
                transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseOver={(e) => {
                if (interativo) e.currentTarget.style.borderColor = accent || COLORS.text;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.muted }}>
                <Icon size={20} strokeWidth={2} color={accent || COLORS.muted} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: accent || COLORS.muted }}>
                    {label}
                </span>
            </div>
            <span style={{ fontSize: "2.5rem", fontWeight: 600, color: accent || COLORS.text, lineHeight: 1 }}>
                {value}
            </span>
            {hint && (
                <span style={{ fontSize: "0.85rem", color: COLORS.subtle }}>{hint}</span>
            )}
        </div>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);

    useEffect(() => {
        apiRequest("/produtos")
            .then((res) => res && res.json())
            .then((dados) => {
                if (Array.isArray(dados)) setProdutos(dados);
            })
            .catch((err) => console.error("Falha na API", err));

        apiRequest("/movimentacoes")
            .then((res) => res && res.json())
            .then((dados) => {
                if (Array.isArray(dados)) setMovimentacoes(dados);
            })
            .catch((err) => console.error("Falha na API Movimentacoes", err));
    }, []);

    const stats = useMemo(() => {
        const total = produtos.length;
        const emBaixa = produtos.filter((p) => {
            const min = p.quantidade_minima != null ? p.quantidade_minima : 5;
            return p.quantidade <= min;
        });

        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const noMes = movimentacoes.filter((m) => new Date(m.data_hora) >= inicioMes);
        const entradasMes = noMes
            .filter((m) => m.tipo === "entrada")
            .reduce((acc, m) => acc + (m.quantidade || 0), 0);
        const saidasMes = noMes
            .filter((m) => m.tipo === "saida")
            .reduce((acc, m) => acc + (m.quantidade || 0), 0);

        return { total, emBaixa, entradasMes, saidasMes };
    }, [produtos, movimentacoes]);

    return (
        <div style={{ paddingBottom: "3rem", textAlign: "left", maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.9rem", fontWeight: 600, color: COLORS.text, margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
                        {saudacao()}
                    </h1>
                    <p style={{ color: COLORS.muted, margin: 0, fontSize: "0.92rem" }}>
                        Visão geral do estoque do Panela de Barro
                    </p>
                </div>
                <span style={{ fontSize: "0.85rem", color: COLORS.subtle, textTransform: "capitalize" }}>
                    {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                </span>
            </div>

            {/* Métricas */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: 16,
                marginBottom: "2.5rem",
            }}>
                <MetricCard
                    icon={Package}
                    label="Total de itens"
                    value={stats.total}
                    hint="produtos cadastrados"
                />
                <MetricCard
                    icon={AlertCircle}
                    label="Em baixa"
                    value={stats.emBaixa.length}
                    hint={stats.emBaixa.length > 0 ? "requer reposição" : "estoque saudável"}
                    accent={stats.emBaixa.length > 0 ? COLORS.red : undefined}
                    onClick={() => navigate("/estoque", { state: { filterLowStock: true } })}
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Entradas no mês"
                    value={`+${stats.entradasMes}`}
                    hint="unidades recebidas"
                    accent={COLORS.green}
                />
                <MetricCard
                    icon={TrendingDown}
                    label="Saídas no mês"
                    value={`-${stats.saidasMes}`}
                    hint="unidades consumidas"
                    accent={COLORS.red}
                />
            </div>

            {/* Painel itens em baixa */}
            <aside style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                    <header style={{ padding: "1.1rem 1.4rem", borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgSoft, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: COLORS.text }}>Repor agora</h3>
                        <ShoppingCart size={16} color={COLORS.muted} />
                    </header>
                    {stats.emBaixa.length > 0 ? (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {stats.emBaixa.slice(0, 6).map((p) => {
                                const min = p.quantidade_minima != null ? p.quantidade_minima : 5;
                                return (
                                    <li
                                        key={p.id}
                                        onClick={() => navigate("/lista-compras")}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.9rem 1.4rem",
                                            borderTop: `1px solid ${COLORS.border}`,
                                            cursor: "pointer",
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.bgSoft)}
                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                    >
                                        <span style={{ fontSize: "0.9rem", color: COLORS.text, fontWeight: 500 }}>
                                            {p.nome}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: COLORS.red, fontWeight: 600 }}>
                                            {p.quantidade}/{min}
                                        </span>
                                    </li>
                                );
                            })}
                            {stats.emBaixa.length > 6 && (
                                <li
                                    onClick={() => navigate("/estoque", { state: { filterLowStock: true } })}
                                    style={{ padding: "0.9rem 1.4rem", borderTop: `1px solid ${COLORS.border}`, textAlign: "center", color: COLORS.muted, fontSize: "0.82rem", cursor: "pointer" }}
                                >
                                    +{stats.emBaixa.length - 6} item(ns) →
                                </li>
                            )}
                        </ul>
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: COLORS.subtle, fontSize: "0.88rem" }}>
                            Tudo em ordem. Nenhum item em baixa.
                        </div>
                    )}
            </aside>
        </div>
    );
}

export default Dashboard;
