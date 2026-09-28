import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiShuffle } from 'react-icons/fi';
import { searchMeals, getCategories, filterByCategory, getMealDetail, getRandomByCategory, getFavorites, addFavorite, deleteFavorite } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import RecipeModal from '../components/RecipeModal';
import styles from './Search.module.css';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favoritesMap, setFavoritesMap] = useState({});

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.categories));
    loadFavorites();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q) {
      setQuery(q);
      handleSearch(q);
    } else if (cat) {
      setSelectedCategory(cat);
      handleCategoryFilter(cat);
    }
  }, [searchParams]);

  const loadFavorites = async () => {
    const res = await getFavorites({ per_page: 50 });
    const map = {};
    res.data.items.forEach((r) => { map[r.external_id] = r; });
    setFavoritesMap(map);
  };

  const handleSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    setSelectedCategory('');
    const res = await searchMeals(term);
    setMeals(res.data.results);
    setLoading(false);
  };

  const handleCategoryFilter = async (category) => {
    setLoading(true);
    setSelectedCategory(category);
    setQuery('');
    const res = await filterByCategory(category);
    setMeals(res.data.results);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    handleSearch(query);
  };

  const handleViewDetail = async (meal) => {
    const res = await getMealDetail(meal.id);
    setSelectedMeal(res.data);
  };

  const handleToggleFavorite = async (meal) => {
    if (favoritesMap[meal.id]) {
      await deleteFavorite(favoritesMap[meal.id].id);
    } else {
      let fullMeal = meal;
      if (!meal.category || !meal.instructions) {
        const res = await getMealDetail(meal.id);
        fullMeal = res.data;
      }
      const ingredientsStr = fullMeal.ingredients
        ? JSON.stringify(fullMeal.ingredients)
        : '';
      await addFavorite({
        external_id: fullMeal.id,
        name: fullMeal.name,
        category: fullMeal.category || '',
        area: fullMeal.area || '',
        instructions: fullMeal.instructions || '',
        image_url: fullMeal.image_url || '',
        ingredients: ingredientsStr,
      });
    }
    await loadFavorites();
  };

  return (
    <div className="container">
      <div className={styles.header}>
        <h1>Explorar Receitas</h1>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar receitas..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Buscar</button>
        </form>
      </div>

      <div className={styles.randomRow}>
        <select
          className={styles.randomSelect}
          value={selectedCategory}
          onChange={(e) => {
            const cat = e.target.value;
            setSelectedCategory(cat);
          }}
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <button
          className={styles.randomBtn}
          disabled={!selectedCategory}
          onClick={async () => {
            if (!selectedCategory) return;
            setLoading(true);
            try {
              const res = await getRandomByCategory(selectedCategory);
              setSelectedMeal(res.data);
            } catch (err) {
              alert('Erro ao buscar receita aleatoria. Tente novamente.');
            }
            setLoading(false);
          }}
        >
          <FiShuffle /> Receita aleatoria
        </button>
      </div>

      <div className={styles.categories}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${selectedCategory === cat.name ? styles.catActive : ''}`}
            onClick={() => {
              setSearchParams({ category: cat.name });
              handleCategoryFilter(cat.name);
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : meals.length > 0 ? (
        <div className={styles.grid}>
          {meals.map((meal) => (
            <RecipeCard
              key={meal.id}
              meal={meal}
              onFavorite={handleToggleFavorite}
              onView={handleViewDetail}
              isFavorited={!!favoritesMap[meal.id]}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Busque receitas pelo nome ou selecione uma categoria acima</p>
        </div>
      )}

      {selectedMeal && (
        <RecipeModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onFavorite={handleToggleFavorite}
          isFavorited={!!favoritesMap[selectedMeal.id]}
          favoriteData={favoritesMap[selectedMeal.id]}
        />
      )}
    </div>
  );
}
