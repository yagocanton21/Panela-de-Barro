import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

function Layout({ children }) {
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <div className="app-layout">
            {/* Botão de Menu para Celular */}
            <button 
                className="menu-toggle" 
                onClick={() => setMenuAberto(!menuAberto)}
                aria-label="Abrir menu"
            >
                {menuAberto ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar agora recebe o estado de abertura */}
            <Sidebar aberta={menuAberto} onClose={() => setMenuAberto(false)} />

            {/* Conteúdo Principal */}
            <main className="main-content">
                {children}
            </main>

            {/* Fundo escurecido (Overlay) que fecha o menu ao clicar fora */}
            {menuAberto && (
                <div className="menu-overlay" onClick={() => setMenuAberto(false)}></div>
            )}
        </div>
    );
}

export default Layout;
