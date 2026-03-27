import { Navigate } from "react-router-dom";

// Componente "porteiro" que protege rotas
function PrivateRoute({ children }) {
    const usuarioLogado = localStorage.getItem("usuarioLogado");

    // Se não tem usuário logado, redireciona para o login
    if (!usuarioLogado) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default PrivateRoute;
