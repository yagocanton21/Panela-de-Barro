import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../utils/auth";

// Componente que restringe acesso a telas exclusivas de administradores
function AdminRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

export default AdminRoute;
