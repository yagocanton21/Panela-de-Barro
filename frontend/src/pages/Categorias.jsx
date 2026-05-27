import { useState, useEffect } from "react";
import { Tag, Edit2, Trash2, X, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function Categorias() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [nome, setNome] = useState("");
    const [editandoId, setEditandoId] = useState(null);

    // Carregar categorias do banco
    const carregarCategorias = () => {
        apiRequest("/categorias")
            .then(res => res && res.json())
            .then(dados => {
                if (Array.isArray(dados)) setCategorias(dados);
            })
            .catch(err => console.error("Erro ao carregar categorias", err));
    };

    useEffect(() => {
        carregarCategorias();
    }, []);

    const handleSalvar = async (e) => {
        e.preventDefault();
        const endpoint = editandoId
            ? `/categorias/${editandoId}`
            : "/categorias";

        const metodo = editandoId ? "PUT" : "POST";

        try {
            const response = await apiRequest(endpoint, {
                method: metodo,
                body: JSON.stringify({ nome })
            });

            if (response && response.ok) {
                setNome("");
                setEditandoId(null);
                carregarCategorias();
            } else if (response) {
                const dados = await response.json();
                alert(dados.detail || "Erro ao salvar categoria.");
            }
        } catch (err) {
            console.error("Erro ao salvar", err);
            alert("Erro de conexão com o servidor.");
        }
    };

    // Deletar categoria
    const handleDeletar = async (id) => {
        if (window.confirm("Deseja realmente excluir esta categoria?")) {
            try {
                const response = await apiRequest(`/categorias/${id}`, {
                    method: "DELETE"
                });

                if (response && response.ok) {
                    carregarCategorias();
                } else if (response) {
                    const dados = await response.json();
                    alert(dados.message || "Erro ao deletar categoria.");
                }
            } catch (err) {
                console.error("Erro ao deletar", err);
                alert("Erro de conexão com o servidor ao excluir.");
            }
        }
    };

    const handleEditar = (categoria) => {
        setEditandoId(categoria.id);
        setNome(categoria.nome);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: "left" }}>

            {/* Voltar */}
            <button
                onClick={() => navigate("/estoque")}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
                    border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem',
                    padding: 0, fontSize: '0.9rem', transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--terracota)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
            >
                <ArrowLeft size={16} /> Voltar para o Estoque
            </button>

            {/* Título */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                <div style={{
                    backgroundColor: 'var(--terracota)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 4px 10px rgba(131, 62, 32, 0.2)'
                }}>
                    <Tag size={28} />
                </div>
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.4rem', fontWeight: 'bold' }}>
                    Gestão de Categorias
                </h1>
            </div>

            {/* Formulário de Cadastro/Edição */}
            <div className="card" style={{ display: 'block', padding: '2rem', marginBottom: "2rem", borderTop: '4px solid var(--terracota)' }}>
                <form onSubmit={handleSalvar} style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", marginBottom: "10px", fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                            {editandoId ? "EDITAR CATEGORIA" : "NOME DA CATEGORIA"}
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Proteínas, Hortifruti..."
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '10px',
                                border: '1px solid var(--border-light)', outline: 'none',
                                backgroundColor: '#fdfdfd', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            style={{
                                padding: '14px 24px', borderRadius: '10px',
                                backgroundColor: 'var(--terracota)', color: 'white',
                                border: 'none', fontSize: '1rem', fontWeight: 'bold',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                gap: '8px', transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(131, 62, 32, 0.3)'
                            }}
                            onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)', e.target.style.filter = 'brightness(1.1)')}
                            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.filter = 'brightness(1)')}
                        >
                            {editandoId ? <Edit2 size={18} /> : <Plus size={18} />}
                            {editandoId ? "Atualizar" : "Cadastrar"}
                        </button>

                        {editandoId && (
                            <button
                                type="button"
                                onClick={() => { setEditandoId(null); setNome(""); }}
                                style={{
                                    padding: '14px', borderRadius: '10px',
                                    backgroundColor: '#9da5ad', color: 'white',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#7d858d'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#9da5ad'}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de Categorias em Grid */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{
                    marginBottom: "1.5rem",
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'var(--text-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Tag size={20} color="var(--terracota)" />
                    Categorias Ativas
                </h3>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "24px"
                }}>
                    {categorias.length > 0 ? categorias.map(cat => (
                        <div key={cat.id} className="category-card" style={{
                            position: 'relative',
                            padding: "1.8rem",
                            borderRadius: "20px",
                            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 248, 0.9) 100%)",
                            border: "1px solid rgba(131, 62, 32, 0.1)",
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '1.5rem',
                            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                            backdropFilter: 'blur(10px)',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative background blur */}
                            <div style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '-40px',
                                width: '120px',
                                height: '120px',
                                background: 'radial-gradient(circle, rgba(131, 62, 32, 0.15) 0%, rgba(255,255,255,0) 70%)',
                                borderRadius: '50%',
                                zIndex: 0,
                                pointerEvents: 'none'
                            }}></div>

                            {/* Header: Icon & Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '12px',
                                    borderRadius: '16px',
                                    color: 'var(--terracota)',
                                    boxShadow: '0 4px 15px rgba(131, 62, 32, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Tag size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{
                                        fontWeight: '700',
                                        fontSize: '1.15rem',
                                        color: 'var(--text-dark)',
                                        display: 'block',
                                        wordBreak: 'break-word',
                                        lineHeight: '1.3'
                                    }}>
                                        {cat.nome}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        Categoria Ativa
                                    </span>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="category-actions" style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: 'auto',
                                zIndex: 1,
                                width: '100%'
                            }}>
                                <button
                                    onClick={() => handleEditar(cat)}
                                    className="action-btn edit-btn"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: "white",
                                        border: "1px solid rgba(131, 62, 32, 0.15)",
                                        color: "var(--terracota)",
                                        cursor: "pointer",
                                        padding: "10px",
                                        borderRadius: "12px",
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: "all 0.2s ease"
                                    }}
                                    title="Editar"
                                >
                                    <Edit2 size={16} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDeletar(cat.id)}
                                    className="action-btn delete-btn"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: "white",
                                        border: "1px solid rgba(231, 76, 60, 0.15)",
                                        color: "#e74c3c",
                                        cursor: "pointer",
                                        padding: "10px",
                                        borderRadius: "12px",
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: "all 0.2s ease"
                                    }}
                                    title="Excluir"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>

                            <style>{`
                                .category-card:hover {
                                    transform: translateY(-6px) scale(1.02);
                                    border-color: rgba(131, 62, 32, 0.25) !important;
                                    box-shadow: 0 15px 40px rgba(131, 62, 32, 0.12) !important;
                                }
                                .action-btn.edit-btn:hover {
                                    background: var(--terracota) !important;
                                    color: white !important;
                                }
                                .action-btn.delete-btn:hover {
                                    background: #e74c3c !important;
                                    color: white !important;
                                }
                            `}</style>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', borderRadius: '20px' }}>
                            <Tag size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>Nenhuma categoria encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Categorias;
