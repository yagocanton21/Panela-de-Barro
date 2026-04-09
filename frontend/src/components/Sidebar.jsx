import { LayoutGrid, Package, Settings, LogOut, Tag, ArrowUpDown, ClipboardList, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ aberta, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <aside className={`sidebar ${aberta ? 'aberta' : ''}`}>
            {/* Logo e Título do Sistema */}
            <div className="sidebar-logo" style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--terracota)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '2rem'
            }}>
                <Package size={32} />
                <span>Panela de Barro</span>
            </div>

            {/* Menu de Navegação - Fecha ao clicar (onClose) no mobile */}
            <nav
                onClick={onClose}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}
            >
                <NavLink to="/admin" className="sidebar-nav-item" style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent', transition: 'all 0.2s'
                })}>
                    <LayoutGrid size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/estoque" className="sidebar-nav-item" style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent', transition: 'all 0.2s'
                })}>
                    <Package size={20} />
                    <span>Estoque</span>
                </NavLink>

                <NavLink to="/cadastrar" className="sidebar-nav-item" style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent', transition: 'all 0.2s'
                })}>
                    <Plus size={20} />
                    <span>Cadastrar</span>
                </NavLink>

                <NavLink to="/categorias" className="sidebar-nav-item" style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent', transition: 'all 0.2s'
                })}>
                    <Tag size={20} />
                    <span>Categorias</span>
                </NavLink>

                <NavLink to="/movimentacoes" className="sidebar-nav-item" style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent', transition: 'all 0.2s'
                })}>
                    <ArrowUpDown size={20} />
                    <span>Movimentações</span>
                </NavLink>

                <NavLink to="/historico" className="sidebar-nav-item" style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent', transition: 'all 0.2s'
                })}>
                    <ClipboardList size={20} />
                    <span>Histórico</span>
                </NavLink>
            </nav>

            {/* Rodapé da Sidebar */}
            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <div onClick={onClose} className="sidebar-nav-item" style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#9da5ad', cursor: 'pointer'
                }}>
                    <Settings size={20} />
                    <span>Ajustes</span>
                </div>

                <div
                    onClick={() => { handleLogout(); onClose(); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        color: '#e74c3c', cursor: 'pointer', marginTop: '4px'
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
