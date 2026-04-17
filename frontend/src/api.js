// frontend/src/api.js

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("access_token");

    // Configura os headers padrão (JSON + Token se existir)
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Se o backend retornar 401 (Não Autorizado)
        if (response.status === 401 && !window.location.pathname.includes("/login")) {
            console.warn("Sessão expirada. Redirecionando para o login...");

            // Limpa os dados de login salvos
            localStorage.removeItem("access_token");
            localStorage.removeItem("usuarioLogado");

            // Redireciona para a página de login e mata a execução aqui
            window.location.href = "/login";
            return;
        }

        return response;
    } catch (error) {
        console.error("Erro na requisição:", error);
        throw error;
    }
};
