import { useRef, useEffect } from "react";
import { Tag, Edit2, Trash2, X, Check } from "lucide-react";
import styles from "./CategoryCard.module.css";

function CategoryCard({ cat, editandoId, editandoNome, setEditandoNome, onEditar, onCancelar, onSalvar, onDeletar }) {
    const inputInlineRef = useRef(null);
    const isEditing = editandoId === cat.id;

    useEffect(() => {
        if (isEditing && inputInlineRef.current) {
            inputInlineRef.current.focus();
            inputInlineRef.current.select();
        }
    }, [isEditing]);

    return (
        <div className={`${styles.card}${isEditing ? ` ${styles.editing}` : ""}`}>
            {isEditing ? (
                <>
                    <div className={styles.editingHeader}>
                        <div className={styles.editingIconContainer}>
                            <Edit2 size={20} />
                        </div>
                        <span className={styles.editingLabel}>Editando</span>
                    </div>

                    <input
                        ref={inputInlineRef}
                        className={styles.inlineInput}
                        type="text"
                        value={editandoNome}
                        onChange={(e) => setEditandoNome(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSalvar(cat.id);
                            if (e.key === "Escape") onCancelar();
                        }}
                    />

                    <div className={styles.editingActions}>
                        <button className={styles.saveButton} onClick={() => onSalvar(cat.id)}>
                            <Check size={16} /> Salvar
                        </button>
                        <button className={styles.cancelButton} onClick={onCancelar} title="Cancelar">
                            <X size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.viewHeader}>
                        <div className={styles.viewIconContainer}>
                            <Tag size={24} />
                        </div>
                        <div>
                            <span className={styles.viewName}>{cat.nome}</span>
                            <span className={styles.viewSubtext}>Categoria Ativa</span>
                        </div>
                    </div>

                    <div className={styles.cardActions}>
                        <button onClick={() => onEditar(cat)} className={styles.editButton} title="Editar">
                            <Edit2 size={16} /> Editar
                        </button>
                        <button onClick={() => onDeletar(cat.id)} className={styles.deleteButton} title="Excluir">
                            <Trash2 size={16} /> Excluir
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CategoryCard;
