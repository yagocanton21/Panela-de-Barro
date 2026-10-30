// Helpers de autenticação (JWT)

export const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuarioLogado");
};

// Decodifica payload do JWT sem dependência externa
const decodeJwtPayload = (token) => {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

// Retorna true se houver token válido e não expirado no storage
export const isAuthenticated = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") {
        clearAuth();
        return false;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSeconds) {
        clearAuth();
        return false;
    }

    return true;
};

// Retorna os dados do usuário autenticado a partir do storage ou JWT
export const getUsuarioLogado = () => {
    try {
        const raw = localStorage.getItem("usuarioLogado");
        if (raw) return JSON.parse(raw);
    } catch {}

    const token = localStorage.getItem("access_token");
    if (token) {
        return decodeJwtPayload(token);
    }
    return null;
};

// Retorna se o usuário logado possui perfil de administrador
export const isAdmin = () => {
    if (!isAuthenticated()) return false;
    const user = getUsuarioLogado();
    return Boolean(user && user.is_admin);
};

