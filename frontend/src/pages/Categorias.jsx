import { useState, useEffect } from "react";
import { Tag, Plus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CategoryCard from "../components/CategoryCard";
import styles from "./Categorias.module.css";

const ITEMS_POR_PAGINA = 8;

function Categorias() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [nome, setNome] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [editandoNome, setEditandoNome] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);

    const carregarCategorias = () => {
        apiRequest("/categorias")
            .then(res => res && res.json())
            .then(dados => {
                if (Array.isArray(dados)) {
                    setCategorias(dados);
                    setPaginaAtual(1);
                }
            })
            .catch(err => console.error("Erro ao carregar categorias", err));
    };

    useEffect(() => {
        carregarCategorias();
    }, []);

    const handleSalvar = async (e) => {
        e.preventDefault();
        try {
            const response = await apiRequest("/categorias", {
                method: "POST",
                body: JSON.stringify({ nome })
            });
            if (response && response.ok) {
                setNome("");
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

    const handleSalvarInline = async (id) => {
        if (!editandoNome.trim()) return;
        try {
            const response = await apiRequest(`/categorias/${id}`, {
                method: "PUT",
                body: JSON.stringify({ nome: editandoNome })
            });
            if (response && response.ok) {
                setEditandoId(null);
                setEditandoNome("");
                carregarCategorias();
            } else if (response) {
                const dados = await response.json();
                alert(dados.detail || "Erro ao editar categoria.");
            }
        } catch (err) {
            console.error("Erro ao editar", err);
            alert("Erro de conexão com o servidor.");
        }
    };

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
        setEditandoNome(categoria.nome);
    };

    const handleCancelarEdicao = () => {
        setEditandoId(null);
        setEditandoNome("");
    };

    const totalPaginas = Math.ceil(categorias.length / ITEMS_POR_PAGINA);
    const inicio = (paginaAtual - 1) * ITEMS_POR_PAGINA;
    const categoriasPagina = categorias.slice(inicio, inicio + ITEMS_POR_PAGINA);

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate("/estoque")}>
                <ArrowLeft size={16} /> Voltar para o Estoque
            </button>

            <div className={styles.titleSection}>
                <div className={styles.titleIcon}>
                    <Tag size={28} />
                </div>
                <h1 className={styles.title}>Gestão de Categorias</h1>
            </div>

            <div className={`card ${styles.formCard}`}>
                <form onSubmit={handleSalvar} className={styles.form}>
                    <div className={styles.formField}>
                        <label className={styles.formLabel}>NOVA CATEGORIA</label>
                        <input
                            type="text"
                            placeholder="Ex: Proteínas, Hortifruti..."
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <div>
                        <button type="submit" className={styles.submitButton}>
                            <Plus size={18} /> Cadastrar
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                    <Tag size={20} color="var(--terracota)" />
                    Categorias Ativas
                    {categorias.length > 0 && (
                        <span className={styles.totalBadge}>{categorias.length}</span>
                    )}
                </h3>

                <div className={styles.grid}>
                    {categorias.length > 0 ? categoriasPagina.map(cat => (
                        <CategoryCard
                            key={cat.id}
                            cat={cat}
                            editandoId={editandoId}
                            editandoNome={editandoNome}
                            setEditandoNome={setEditandoNome}
                            onEditar={handleEditar}
                            onCancelar={handleCancelarEdicao}
                            onSalvar={handleSalvarInline}
                            onDeletar={handleDeletar}
                        />
                    )) : (
                        <div className={styles.emptyState}>
                            <Tag size={40} className={styles.emptyIcon} />
                            <p>Nenhuma categoria encontrada.</p>
                        </div>
                    )}
                </div>

                {totalPaginas > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                            disabled={paginaAtual === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pg => (
                            <button
                                key={pg}
                                className={`${styles.pageBtn} ${pg === paginaAtual ? styles.pageBtnActive : ""}`}
                                onClick={() => setPaginaAtual(pg)}
                            >
                                {pg}
                            </button>
                        ))}

                        <button
                            className={styles.pageBtn}
                            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaAtual === totalPaginas}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Categorias;
