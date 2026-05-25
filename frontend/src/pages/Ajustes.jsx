import { useState, useEffect } from "react";
import { apiRequest } from "../api";

const formInicial = { nome_exibicao: "", usuario: "", senha: "", is_admin: false };

function Ajustes() {
    const [usuarios, setUsuarios] = useState([]);
    const [formUsuario, setFormUsuario] = useState(formInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const carregarUsuarios = async () => {
        const res = await apiRequest("/usuarios");
        if (res && res.ok) setUsuarios(await res.json());
    };

    useEffect(() => { carregarUsuarios(); }, []);

    const limparForm = () => {
        setFormUsuario(formInicial);
        setEditandoId(null);
        setErro("");
    };

    const iniciarEdicao = (u) => {
        setFormUsuario({ nome_exibicao: u.nome_exibicao, usuario: u.usuario, senha: "", is_admin: u.is_admin });
        setEditandoId(u.id);
        setErro(""); setSucesso("");
    };

    const salvarUsuario = async (e) => {
        e.preventDefault();
        setErro(""); setSucesso("");

        const editando = editandoId !== null;
        const url = editando ? `/usuarios/${editandoId}` : "/usuarios";
        const method = editando ? "PUT" : "POST";

        const payload = { ...formUsuario };
        if (editando && !payload.senha) delete payload.senha;

        const res = await apiRequest(url, {
            method,
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            setSucesso(editando ? "Usuário editado com sucesso!" : "Usuário criado com sucesso!");
            limparForm();
            carregarUsuarios();
        } else {
            const data = await res.json();
            setErro(data.detail || (editando ? "Erro ao editar usuário" : "Erro ao criar usuário"));
        }
    };

    const deletarUsuario = async (id) => {
        if (!confirm("Tem certeza que deseja deletar este usuário?")) return;
        await apiRequest(`/usuarios/${id}`, { method: "DELETE" });
        if (editandoId === id) limparForm();
        carregarUsuarios();
    };

    const editando = editandoId !== null;

    return (
        <div style={{ padding: "2rem", maxWidth: "600px" }}>
            <h1 className="page-title">Ajustes</h1>

            <h2 style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--text-dark)" }}>Usuários do Sistema</h2>

            {usuarios.map(u => (
                <div key={u.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "#faf8f5", borderRadius: "8px",
                    marginBottom: "8px", border: "1px solid #e8e0d5", flexWrap: "wrap", gap: "12px"
                }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <strong style={{ color: "var(--text-dark)" }}>{u.nome_exibicao}</strong>
                        <span style={{ color: "#9da5ad", marginLeft: "8px" }}>@{u.usuario}</span>
                        {u.is_admin && (
                            <span style={{ marginLeft: "8px", color: "var(--terracota)", fontSize: "12px", fontWeight: "600" }}>
                                admin
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flex: "1 1 100%" }}>
                        <button onClick={() => iniciarEdicao(u)} style={{
                            flex: 1, background: "none", border: "1px solid var(--terracota)", color: "var(--terracota)",
                            borderRadius: "6px", padding: "10px 12px", cursor: "pointer", fontSize: "14px"
                        }}>
                            Editar
                        </button>
                        <button onClick={() => deletarUsuario(u.id)} style={{
                            flex: 1, background: "none", border: "1px solid #e74c3c", color: "#e74c3c",
                            borderRadius: "6px", padding: "10px 12px", cursor: "pointer", fontSize: "14px"
                        }}>
                            Deletar
                        </button>
                    </div>
                </div>
            ))}

            <h2 style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--text-dark)" }}>
                {editando ? "Editar Usuário" : "Novo Usuário"}
            </h2>

            {erro && <p style={{ color: "#e74c3c", marginBottom: "12px" }}>{erro}</p>}
            {sucesso && <p style={{ color: "green", marginBottom: "12px" }}>{sucesso}</p>}

            <form onSubmit={salvarUsuario} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                    placeholder="Nome de exibição"
                    value={formUsuario.nome_exibicao}
                    onChange={e => setFormUsuario({ ...formUsuario, nome_exibicao: e.target.value })}
                    required
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "16px", background: "#faf8f5" }}
                />
                <input
                    placeholder="Usuário (login)"
                    value={formUsuario.usuario}
                    onChange={e => setFormUsuario({ ...formUsuario, usuario: e.target.value })}
                    required
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "16px", background: "#faf8f5" }}
                />
                <input
                    placeholder={editando ? "Senha (deixe em branco para manter)" : "Senha"}
                    type="password"
                    value={formUsuario.senha}
                    onChange={e => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                    required={!editando}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "16px", background: "#faf8f5" }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dark)", cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={formUsuario.is_admin}
                        onChange={e => setFormUsuario({ ...formUsuario, is_admin: e.target.checked })}
                    />
                    Administrador
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" style={{
                        flex: 1, padding: "12px", background: "var(--terracota)", color: "white",
                        border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "600"
                    }}>
                        {editando ? "Salvar Alterações" : "Criar Usuário"}
                    </button>
                    {editando && (
                        <button type="button" onClick={limparForm} style={{
                            padding: "12px 20px", background: "none", color: "var(--text-dark)",
                            border: "1px solid #e8e0d5", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "600"
                        }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Ajustes;
