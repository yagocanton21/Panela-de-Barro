import { useState, useEffect } from "react";
import { apiRequest } from "../api";

function Ajustes() {
    const [usuarios, setUsuarios] = useState([]);
    const [novoUsuario, setNovoUsuario] = useState({ nome_exibicao: "", usuario: "", senha: "", is_admin: false });
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const carregarUsuarios = async () => {
        const res = await apiRequest("/usuarios");
        if (res && res.ok) setUsuarios(await res.json());
    };

    useEffect(() => { carregarUsuarios(); }, []);

    const criarUsuario = async (e) => {
        e.preventDefault();
        setErro(""); setSucesso("");
        const res = await apiRequest("/usuarios", {
            method: "POST",
            body: JSON.stringify(novoUsuario)
        });
        if (res && res.ok) {
            setSucesso("Usuário criado com sucesso!");
            setNovoUsuario({ nome_exibicao: "", usuario: "", senha: "", is_admin: false });
            carregarUsuarios();
        } else {
            const data = await res.json();
            setErro(data.detail || "Erro ao criar usuário");
        }
    };

    const deletarUsuario = async (id) => {
        if (!confirm("Tem certeza que deseja deletar este usuário?")) return;
        await apiRequest(`/usuarios/${id}`, { method: "DELETE" });
        carregarUsuarios();
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px" }}>
            <h1 className="page-title">Ajustes</h1>

            <h2 style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--text-dark)" }}>Usuários do Sistema</h2>

            {usuarios.map(u => (
                <div key={u.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "#faf8f5", borderRadius: "8px",
                    marginBottom: "8px", border: "1px solid #e8e0d5"
                }}>
                    <div>
                        <strong style={{ color: "var(--text-dark)" }}>{u.nome_exibicao}</strong>
                        <span style={{ color: "#9da5ad", marginLeft: "8px" }}>@{u.usuario}</span>
                        {u.is_admin && (
                            <span style={{ marginLeft: "8px", color: "var(--terracota)", fontSize: "12px", fontWeight: "600" }}>
                                admin
                            </span>
                        )}
                    </div>
                    <button onClick={() => deletarUsuario(u.id)} style={{
                        background: "none", border: "1px solid #e74c3c", color: "#e74c3c",
                        borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "14px"
                    }}>
                        Deletar
                    </button>
                </div>
            ))}

            <h2 style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--text-dark)" }}>Novo Usuário</h2>

            {erro && <p style={{ color: "#e74c3c", marginBottom: "12px" }}>{erro}</p>}
            {sucesso && <p style={{ color: "green", marginBottom: "12px" }}>{sucesso}</p>}

            <form onSubmit={criarUsuario} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                    placeholder="Nome de exibição"
                    value={novoUsuario.nome_exibicao}
                    onChange={e => setNovoUsuario({ ...novoUsuario, nome_exibicao: e.target.value })}
                    required
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "16px", background: "#faf8f5" }}
                />
                <input
                    placeholder="Usuário (login)"
                    value={novoUsuario.usuario}
                    onChange={e => setNovoUsuario({ ...novoUsuario, usuario: e.target.value })}
                    required
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "16px", background: "#faf8f5" }}
                />
                <input
                    placeholder="Senha"
                    type="password"
                    value={novoUsuario.senha}
                    onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                    required
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "16px", background: "#faf8f5" }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dark)", cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={novoUsuario.is_admin}
                        onChange={e => setNovoUsuario({ ...novoUsuario, is_admin: e.target.checked })}
                    />
                    Administrador
                </label>
                <button type="submit" style={{
                    padding: "12px", background: "var(--terracota)", color: "white",
                    border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "600"
                }}>
                    Criar Usuário
                </button>
            </form>
        </div>
    );
}

export default Ajustes;
