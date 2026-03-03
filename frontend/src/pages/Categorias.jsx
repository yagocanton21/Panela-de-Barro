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

    const handleSalvar = (e) => {
        e.preventDefault();
        const url = editandoId
            ? `http://127.0.0.1:8000/categorias/${editandoId}`
            : "http://127.0.0.1:8000/categorias";

        const metodo = editandoId ? "PUT" : "POST";

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nome)
        })
            .then(() => {
                setNome("");
                setEditandoId(null);
                carregarCategorias();
            })
            .catch(err => console.error("Erro ao salvar", err));
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "20px"
                }}>
                    {categorias.length > 0 ? categorias.map(cat => (
                        <div key={cat.id} style={{
                            position: 'relative',
                            padding: "24px 16px",
                            borderRadius: "16px",
                            backgroundColor: "#ffffff",
                            border: "1px solid var(--border-light)",
                            textAlign: 'center',
                            transition: "all 0.3s ease",
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'var(--terracota)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                            }}
                        >
                            {/* Ícone de Categoria Decorativo */}
                            <div style={{
                                backgroundColor: 'rgba(131, 62, 32, 0.08)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: 'var(--terracota)',
                                marginBottom: '4px'
                            }}>
                                <Tag size={24} />
                            </div>

                            <span style={{
                                fontWeight: '600',
                                fontSize: '1.05rem',
                                color: 'var(--text-dark)',
                                textTransform: 'capitalize'
                            }}>
                                {cat.nome}
                            </span>

                            {/* Botões de Ação */}
                            <div style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: '8px',
                                paddingTop: '15px',
                                borderTop: '1px solid #f5f0e6',
                                width: '100%',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => handleEditar(cat)}
                                    style={{ background: "none", border: "none", color: "#9da5ad", cursor: "pointer", transition: "color 0.2s" }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--terracota)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#9da5ad'}
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeletar(cat.id)}
                                    style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", transition: "opacity 0.2s" }}
                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Nenhuma categoria encontrada.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Categorias;
