import { useState, useEffect } from "react";
import { ArrowUpDown, Package } from "lucide-react";

function Movimentacoes() {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        produto_id: "",
        produto_nome: "",
        tipo: "entrada",
        quantidade: "",
        motivo: ""
    });

    const carregarProdutos = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/produtos");
            const dados = await res.json();
            if (Array.isArray(dados)) setProdutos(dados);
        } catch (err) {
            console.error("Erro ao carregar produtos:", err);
        }
    };

    useEffect(() => {
        carregarProdutos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            produto_id: parseInt(formData.produto_id),
            tipo: formData.tipo,
            quantidade: parseInt(formData.quantidade),
            motivo: formData.motivo
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/movimentacoes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const dados = await response.json();

            if (response.ok) {
                setFormData({ produto_id: "", produto_nome: "", tipo: "entrada", quantidade: "", motivo: "" });
                carregarProdutos();
                alert("Movimentação registrada com sucesso!");
            } else {
                alert(dados.message || "Erro ao registrar.");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>

            {/* Título da Página */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                <div style={{
                    backgroundColor: 'var(--terracota)', padding: '12px', borderRadius: '12px',
                    color: 'white', display: 'flex', alignItems: 'center',
                    boxShadow: '0 4px 10px rgba(131, 62, 32, 0.2)'
                }}>
                    <ArrowUpDown size={28} />
                </div>
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Movimentações de Estoque
                </h1>
            </div>

            {/* Card de Registro */}
            <div className="card" style={{ display: 'block', padding: '2rem', borderTop: '4px solid var(--terracota)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Registrar Nova Entrada/Saída</h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>PRODUTO</label>
                            <input
                                list="lista-produtos"
                                value={formData.produto_nome}
                                onChange={(e) => {
                                    const digitado = e.target.value;
                                    const encontrado = produtos.find(p => `${p.nome} (${p.quantidade} ${p.unidade_medida})` === digitado);
                                    setFormData({ ...formData, produto_nome: digitado, produto_id: encontrado ? encontrado.id : "" });
                                }}
                                placeholder="Digite para buscar..."
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', backgroundColor: '#fdfdfd' }}
                            />
                            <datalist id="lista-produtos">
                                {produtos.map(p => (
                                    <option key={p.id} value={`${p.nome} (${p.quantidade} ${p.unidade_medida})`} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>TIPO</label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', backgroundColor: '#fdfdfd' }}
                            >
                                <option value="entrada">📈 Entrada</option>
                                <option value="saida">📉 Saída</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>QUANTIDADE</label>
                            <input
                                type="number"
                                value={formData.quantidade}
                                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                                required
                                min="1"
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', backgroundColor: '#fdfdfd' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>MOTIVO / OBSERVAÇÃO</label>
                        <input
                            type="text"
                            value={formData.motivo}
                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                            placeholder="Ex: Reposição de estoque, Uso na cozinha..."
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', backgroundColor: '#fdfdfd' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '10px',
                            backgroundColor: 'var(--terracota)', color: 'white',
                            border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            fontSize: '1rem'
                        }}
                    >
                        {loading ? "Processando..." : <><Package size={20} /> Confirmar Movimentação</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Movimentacoes;
