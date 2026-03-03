import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, PlusCircle, ArrowLeft, CheckCircle } from "lucide-react";

function CadastroProduto() {
    const navigate = useNavigate();

    // Estados do Formulário
    const [categorias, setCategorias] = useState([]);
    const [nome, setNome] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [unidade, setUnidade] = useState("un");

    // Estados de Controle
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [erro, setErro] = useState("");
    const [loadingCategorias, setLoadingCategorias] = useState(true);

    // Carregar categorias do banco
    useEffect(() => {
        fetch("http://127.0.0.1:8000/categorias")
            .then(res => res.json())
            .then(dados => {
                if (Array.isArray(dados)) setCategorias(dados);
            })
            .catch(err => console.error("Erro ao carregar categorias:", err))
            .finally(() => setLoadingCategorias(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro("");

        const novoProduto = {
            nome: nome,
            categoria: parseInt(categoriaId),
            quantidade: parseInt(quantidade),
            unidade_medida: unidade
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/produtos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoProduto)
            });

            const dados = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate("/"), 2000);
            } else {
                setErro(dados.message || dados.detail || "Erro ao cadastrar. Verifique os dados.");
            }
        } catch (error) {
            setErro("Erro de conexão com o servidor. Verifique se o backend está rodando.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
                <div style={{ backgroundColor: '#27ae60', padding: '20px', borderRadius: '50%', color: 'white', marginBottom: '1.5rem' }}>
                    <CheckCircle size={48} />
                </div>
                <h2 style={{ color: 'var(--text-dark)' }}>Produto Cadastrado!</h2>
                <p style={{ color: 'var(--text-muted)' }}>Você será redirecionado para o estoque em instantes.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

            {/* Cabeçalho Superior - Breadcrumb / Voltar */}
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

            {/* Cabeçalho de Título com Ícone */}
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
                    <PlusCircle size={28} />
                </div>
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Novo Produto
                </h1>
            </div>

            {/* Card do Formulário */}
            <form onSubmit={handleSubmit} className="card" style={{ display: 'block', padding: '2.5rem', textAlign: 'left', borderTop: '4px solid var(--terracota)' }}>

                {/* Nome do Produto */}
                <div style={{ marginBottom: '1.8rem' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                        NOME DO PRODUTO
                    </label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        placeholder="Ex: Farinha de trigo"
                        style={{
                            width: '100%', padding: '14px', borderRadius: '10px',
                            border: '1px solid var(--border-light)', outline: 'none',
                            backgroundColor: '#fdfdfd', fontSize: '1rem', boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Linha: Categoria e Unidade */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginBottom: '1.8rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                            CATEGORIA
                        </label>
                        <select
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            required
                            disabled={loadingCategorias}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '10px',
                                border: '1px solid var(--border-light)', outline: 'none',
                                backgroundColor: '#fdfdfd', fontSize: '1rem', cursor: 'pointer'
                            }}
                        >
                            <option value="">{loadingCategorias ? "Carregando..." : categorias.length === 0 ? "Nenhuma categoria encontrada" : "Selecione..."}</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                            ))}
                        </select>
                        {!loadingCategorias && categorias.length === 0 && (
                            <span style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '5px', display: 'block' }}>
                                ⚠ Cadastre uma categoria antes de adicionar produtos.
                            </span>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                            UNIDADE
                        </label>
                        <input
                            list="lista-unidades"
                            type="text"
                            value={unidade}
                            onChange={(e) => setUnidade(e.target.value)}
                            required
                            placeholder="Ex: kg, un, l"
                            style={{
                                width: '100%', padding: '14px', borderRadius: '10px',
                                border: '1px solid var(--border-light)', outline: 'none',
                                backgroundColor: '#fdfdfd', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                        />
                        <datalist id="lista-unidades">
                            <option value="kg" />
                            <option value="g" />
                            <option value="l" />
                            <option value="ml" />
                            <option value="un" />
                            <option value="cx" />
                            <option value="pct" />
                        </datalist>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '5px', display: 'block' }}>
                            Use apenas a sigla: kg, g, l, ml, un, etc.
                        </span>
                    </div>
                </div>

                {/* Quantidade Inicial */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                        QUANTIDADE EM ESTOQUE
                    </label>
                    <input
                        type="number"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        required
                        min="1"
                        placeholder="Ex: 10"
                        style={{
                            width: '100%', padding: '14px', borderRadius: '10px',
                            border: '1px solid var(--border-light)', outline: 'none',
                            backgroundColor: '#fdfdfd', fontSize: '1rem', boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Mensagem de Erro Inline */}
                {erro && (
                    <div style={{
                        backgroundColor: 'rgba(231, 76, 60, 0.08)',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '1.5rem',
                        color: '#e74c3c',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ⚠ {erro}
                    </div>
                )}

                {/* Botão Salvar */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '10px',
                        backgroundColor: 'var(--terracota)', color: 'white',
                        border: 'none', fontSize: '1.1rem', fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '10px', transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(131, 62, 32, 0.3)'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.filter = 'brightness(1.1)')}
                    onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.filter = 'brightness(1)')}
                >
                    {loading ? "Processando..." : (
                        <>
                            <Package size={22} />
                            Salvar Produto
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default CadastroProduto;
