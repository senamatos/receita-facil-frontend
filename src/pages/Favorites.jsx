import { useState, useEffect, useCallback } from 'react';
import { FiHeart, FiTrash2, FiEdit3, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getFavorites, deleteFavorite, updateFavorite, getMealDetail } from '../services/api';
import RecipeModal from '../components/RecipeModal';
import styles from './Favorites.module.css';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favoritesMap, setFavoritesMap] = useState({});

  const loadFavorites = useCallback(async () => {
    const params = { page, per_page: 12 };
    if (categoryFilter) params.category = categoryFilter;
    if (searchFilter) params.search = searchFilter;
    const res = await getFavorites(params);
    setFavorites(res.data.items);
    setTotalPages(res.data.pages);
    setTotal(res.data.total);

    const map = {};
    res.data.items.forEach((r) => { map[r.external_id] = r; });
    setFavoritesMap(map);
  }, [page, categoryFilter, searchFilter]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const handleDelete = async (id) => {
    await deleteFavorite(id);
    loadFavorites();
  };

  const handleUpdate = async (id, data) => {
    await updateFavorite(id, data);
    loadFavorites();
  };

  const handleViewDetail = async (recipe) => {
    const res = await getMealDetail(recipe.external_id);
    setSelectedMeal(res.data);
  };

  const handleToggleFavorite = async (meal) => {
    const fav = favoritesMap[meal.id];
    if (fav) {
      await deleteFavorite(fav.id);
      loadFavorites();
    }
  };

  const uniqueCategories = [...new Set(favorites.map((r) => r.category).filter(Boolean))];

  return (
    <div className="container">
      <div className={styles.header}>
        <h1><FiHeart /> Minhas Receitas Favoritas</h1>
        <span className={styles.count}>{total} receita{total !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }}
          placeholder="Filtrar por nome..."
          className={styles.filterInput}
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className={styles.filterSelect}
        >
          <option value="">Todas as categorias</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {favorites.length > 0 ? (
        <>
          <div className={styles.list}>
            {favorites.map((recipe) => (
              <div key={recipe.id} className={styles.card}>
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className={styles.cardImage}
                  onClick={() => handleViewDetail(recipe)}
                />
                <div className={styles.cardContent}>
                  <h3 onClick={() => handleViewDetail(recipe)}>{recipe.name}</h3>
                  <div className={styles.cardMeta}>
                    {recipe.category && <span className={styles.tag}>{recipe.category}</span>}
                    {recipe.area && <span className={styles.tag}>{recipe.area}</span>}
                  </div>
                  {recipe.rating > 0 && (
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar
                          key={s}
                          size={14}
                          fill={s <= recipe.rating ? '#f59e0b' : 'none'}
                          color={s <= recipe.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  )}
                  {recipe.notes && <p className={styles.notes}>{recipe.notes}</p>}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleViewDetail(recipe)}
                    title="Ver detalhes"
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(recipe.id)}
                    title="Remover dos favoritos"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className={styles.pageBtn}
              >
                <FiChevronLeft /> Anterior
              </button>
              <span className={styles.pageInfo}>
                Pagina {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className={styles.pageBtn}
              >
                Proxima <FiChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <FiHeart size={48} />
          <h2>Nenhuma receita favorita ainda</h2>
          <p>Explore receitas e adicione suas favoritas!</p>
        </div>
      )}

      {selectedMeal && (
        <RecipeModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onFavorite={handleToggleFavorite}
          isFavorited={!!favoritesMap[selectedMeal.id]}
          favoriteData={favoritesMap[selectedMeal.id]}
          onUpdateFavorite={handleUpdate}
        />
      )}
    </div>
  );
}
