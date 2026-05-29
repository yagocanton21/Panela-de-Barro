import { LayoutGrid, Package, Settings, LogOut, Tag, ArrowUpDown, ClipboardList, Plus, ShoppingCart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth } from "../utils/auth";

function Sidebar({ aberta, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    const menuItems = [
        { to: "/admin", icon: LayoutGrid, label: "Dashboard" },
        { to: "/estoque", icon: Package, label: "Estoque" },
        { to: "/cadastrar", icon: Plus, label: "Cadastrar" },
        { to: "/categorias", icon: Tag, label: "Categorias" },
        { to: "/movimentacoes", icon: ArrowUpDown, label: "Movimentações" },
        { to: "/historico", icon: ClipboardList, label: "Histórico" },
        { to: "/lista-compras", icon: ShoppingCart, label: "Lista de Compras" },
    ];

    const navStyle = ({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "8px",
        textDecoration: "none",
        color: isActive ? "white" : "#9da5ad",
        backgroundColor: isActive ? "var(--terracota)" : "transparent",
        transition: "all 0.2s",
    });

    return (
        <aside className={`sidebar ${aberta ? "aberta" : ""}`}>
            {/* Logo */}
            <div className="sidebar-logo" style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--terracota)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "2rem",
            }}>
                <Package size={32} />
                <span>Panela de Barro</span>
            </div>

            {/* Menu */}
            <nav
                onClick={() => onClose && onClose()}
                style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
            >
                {menuItems.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} className="sidebar-nav-item" style={navStyle}>
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Rodapé */}
            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <NavLink to="/ajustes" className="sidebar-nav-item" style={navStyle} onClick={() => onClose && onClose()}>
                    <Settings size={20} />
                    <span>Ajustes</span>
                </NavLink>

                <div
                    onClick={() => { handleLogout(); onClose && onClose(); }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        color: "#e74c3c",
                        cursor: "pointer",
                        marginTop: "4px",
                    }}
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
