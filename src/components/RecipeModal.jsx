import { useState } from 'react';
import { FiX, FiHeart, FiStar } from 'react-icons/fi';
import styles from './RecipeModal.module.css';

export default function RecipeModal({ meal, onClose, onFavorite, isFavorited, favoriteData, onUpdateFavorite }) {
  const [notes, setNotes] = useState(favoriteData?.notes || '');
  const [rating, setRating] = useState(favoriteData?.rating || 0);

  const handleSaveNotes = () => {
    if (favoriteData) {
      onUpdateFavorite(favoriteData.id, { notes, rating });
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.header}>
          <img src={meal.image_url} alt={meal.name} className={styles.image} />
          <div className={styles.headerInfo}>
            <h2>{meal.name}</h2>
            {meal.category && <span className={styles.tag}>{meal.category}</span>}
            {meal.area && <span className={styles.tag}>{meal.area}</span>}
            <button
              className={`${styles.favBtn} ${isFavorited ? styles.favorited : ''}`}
              onClick={() => onFavorite(meal)}
            >
              <FiHeart fill={isFavorited ? 'white' : 'none'} />
              {isFavorited ? 'Nos favoritos' : 'Adicionar aos favoritos'}
            </button>
          </div>
        </div>

        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className={styles.section}>
            <h3>Ingredientes</h3>
            <ul className={styles.ingredients}>
              {meal.ingredients.map((item, i) => (
                <li key={i}>
                  <span className={styles.measure}>{item.measure}</span>
                  <span>{item.ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {meal.instructions && (
          <div className={styles.section}>
            <h3>Modo de Preparo</h3>
            <p className={styles.instructions}>{meal.instructions}</p>
          </div>
        )}

        {isFavorited && favoriteData && (
          <div className={styles.section}>
            <h3>Suas Notas</h3>
            <div className={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={styles.starBtn}
                  onClick={() => setRating(star)}
                >
                  <FiStar
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                    size={22}
                  />
                </button>
              ))}
            </div>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva suas notas sobre esta receita..."
              rows={3}
            />
            <button className={styles.saveBtn} onClick={handleSaveNotes}>
              Salvar notas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
