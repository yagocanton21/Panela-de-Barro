import { useState, useEffect } from "react";
import { Tag, Edit2, Trash2, X, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Categorias() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [nome, setNome] = useState("");
    const [editandoId, setEditandoId] = useState(null);

    // Carregar categorias do banco
    const carregarCategorias = () => {
        fetch("http://127.0.0.1:8000/categorias")
            .then(res => res.json())
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
        const url = editandoId
            ? `http://127.0.0.1:8000/categorias/${editandoId}`
            : "http://127.0.0.1:8000/categorias";

        const metodo = editandoId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome })
            });

            const dados = await response.json();

            if (response.ok) {
                setNome("");
                setEditandoId(null);
                carregarCategorias();
            } else {
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
                const response = await fetch(`http://127.0.0.1:8000/categorias/${id}`, { method: "DELETE" });
                const dados = await response.json();

                if (response.ok) {
                    carregarCategorias();
                } else {
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
                onClick={() => navigate("/")}
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
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Gestão de Categorias
                </h1>
            </div>

            {/* Formulário de Cadastro/Edição */}
            <div className="card" style={{ display: 'block', padding: '2rem', marginBottom: "2rem", borderTop: '4px solid var(--terracota)' }}>
                <form onSubmit={handleSalvar} style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "24px"
                }}>
                    {categorias.length > 0 ? categorias.map(cat => (
                        <div key={cat.id} className="category-card" style={{
                            position: 'relative',
                            padding: "2rem",
                            borderRadius: "24px",
                            backgroundColor: "#ffffff",
                            border: "1px solid var(--border-light)",
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.2rem',
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                            cursor: 'default',
                            overflow: 'hidden'
                        }}>
                            {/* Círculo de fundo decorativo */}
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                right: '-30px',
                                width: '80px',
                                height: '80px',
                                background: 'rgba(131, 62, 32, 0.03)',
                                borderRadius: '50%',
                                zIndex: 0
                            }}></div>

                            {/* Ícone de Categoria Decorativo */}
                            <div style={{
                                backgroundColor: 'rgba(131, 62, 32, 0.08)',
                                padding: '16px',
                                borderRadius: '20px',
                                color: 'var(--terracota)',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Tag size={28} />
                            </div>

                            <div style={{ textAlign: 'center', zIndex: 1 }}>
                                <span style={{
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    color: 'var(--text-dark)',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>
                                    {cat.nome}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                    Categoria Ativa
                                </span>
                            </div>

                            {/* Botões de Ação */}
                            <div style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: '10px',
                                zIndex: 1,
                                width: '100%',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => handleEditar(cat)}
                                    style={{
                                        background: "#f8f9fa",
                                        border: "none",
                                        color: "#7d7569",
                                        cursor: "pointer",
                                        padding: "10px",
                                        borderRadius: "12px",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--terracota)'; e.currentTarget.style.backgroundColor = '#eef0f2'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = '#7d7569'; e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeletar(cat.id)}
                                    style={{
                                        background: "#f8f9fa",
                                        border: "none",
                                        color: "#7d7569",
                                        cursor: "pointer",
                                        padding: "10px",
                                        borderRadius: "12px",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.backgroundColor = '#faeaea'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = '#7d7569'; e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <style>{`
                                .category-card:hover {
                                    transform: translateY(-8px);
                                    border-color: var(--terracota);
                                    box-shadow: 0 15px 35px rgba(131, 62, 32, 0.08);
                                }
                            `}</style>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Nenhum produto encontrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Categorias;
