import { LayoutGrid, Package, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Logo e Título do Sistema */}
            <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--terracota)',
                marginBottom: '3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Package size={32} />
                <span>Panela de Barro</span>
            </div>

            {/* Menu de Navegação */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* Link para o Dashboard (Início) */}
                <NavLink to="/" style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent',
                    transition: 'all 0.2s'
                })}>
                    <LayoutGrid size={20} />
                    Dashboard
                </NavLink>

                {/* Link para a Tela de Cadastro */}
                <NavLink to="/cadastrar" style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#9da5ad',
                    backgroundColor: isActive ? 'var(--terracota)' : 'transparent',
                    transition: 'all 0.2s'
                })}>
                    <Package size={20} />
                    Cadastrar Produto
                </NavLink>

            </nav>

            {/* Rodapé da Sidebar (Configurações / Sair) */}
            <div style={{
                marginTop: "auto",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "1rem"
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    color: '#9da5ad',
                    cursor: 'pointer'
                }}>
                    <Settings size={20} />
                    Configurações
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    marginTop: '4px'
                }}>
                    <LogOut size={20} />
                    Sair
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
