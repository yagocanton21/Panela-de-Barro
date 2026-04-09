import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// Função para fazer login
function Login() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Se o usuário já estiver logado, redireciona direto para o painel de admin
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const usuarioLogado = localStorage.getItem("usuarioLogado");
        if (token && usuarioLogado) {
            navigate("/admin");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            // Chamada para o backend usando o formato de formulário exigido pelo OAuth2
            const params = new URLSearchParams();
            params.append('username', usuario);
            params.append('password', senha);

            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });

            if (response.ok) {
                const data = await response.json();

                // SALVA O TOKEN E OS DADOS DO USUÁRIO
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));

                // Redireciona para o painel de admin
                navigate("/admin");
            } else {
                const errorData = await response.json().catch(() => ({}));
                setErro(errorData.detail || "Usuário ou senha incorretos.");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            setErro("Erro de conexão com o servidor. Verifique se o backend está rodando.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-box-header">
                    <h2>Panela de Barro</h2>
                    <p>Faça login para gerenciar o sistema</p>
                </div>

                {erro && <div className="error-message">{erro}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="usuario">Usuário</label>
                        <input
                            type="text"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Digite seu usuário"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
