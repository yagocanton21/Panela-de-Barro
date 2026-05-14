import { Navigate } from "react-router-dom";

// Componente "porteiro" que protege rotas
function PrivateRoute({ children }) {
    const token = localStorage.getItem("access_token");

    // Sem token válido, redireciona para o login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default PrivateRoute;
