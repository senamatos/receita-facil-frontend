import { FiHeart, FiExternalLink } from 'react-icons/fi';
import styles from './RecipeCard.module.css';

export default function RecipeCard({ meal, onFavorite, onView, isFavorited }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={meal.image_url} alt={meal.name} className={styles.image} />
        {meal.category && (
          <span className={styles.badge}>{meal.category}</span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{meal.name}</h3>
        {meal.area && <p className={styles.area}>{meal.area}</p>}
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${isFavorited ? styles.favorited : ''}`}
            onClick={() => onFavorite(meal)}
            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <FiHeart fill={isFavorited ? '#e11d48' : 'none'} />
          </button>
          <button className={styles.btn} onClick={() => onView(meal)} title="Ver detalhes">
            <FiExternalLink />
          </button>
        </div>
      </div>
    </div>
  );
}
