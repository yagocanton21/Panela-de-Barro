import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

// Componente "porteiro" que protege rotas
function PrivateRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default PrivateRoute;
