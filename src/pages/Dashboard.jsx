import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiHeart, FiSearch, FiTrendingUp, FiGlobe } from 'react-icons/fi';
import { getCategories, filterByCategory, searchMeals, getFavorites } from '../services/api';
import styles from './Dashboard.module.css';

const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#ef4444', '#0ea5e9', '#d946ef'];

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [favStats, setFavStats] = useState({ total: 0, byCategory: [], byRating: [] });
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(async (res) => {
      const cats = res.data.categories;
      setCategories(cats.slice(0, 8));

      const statsPromises = cats.slice(0, 10).map(async (cat) => {
        const r = await filterByCategory(cat.name);
        return { name: cat.name, receitas: r.data.count };
      });
      const stats = await Promise.all(statsPromises);
      setCategoryStats(stats.sort((a, b) => b.receitas - a.receitas));
    });

    searchMeals('chicken').then((res) => setFeatured(res.data.results.slice(0, 6)));

    getFavorites({ per_page: 50 }).then((res) => {
      const items = res.data.items;
      const catCount = {};
      const ratingDist = [
        { name: 'Sem nota', value: 0 },
        { name: '1-2 estrelas', value: 0 },
        { name: '3-4 estrelas', value: 0 },
        { name: '5 estrelas', value: 0 },
      ];

      items.forEach((r) => {
        if (r.category) catCount[r.category] = (catCount[r.category] || 0) + 1;
        if (!r.rating) ratingDist[0].value++;
        else if (r.rating <= 2) ratingDist[1].value++;
        else if (r.rating <= 4) ratingDist[2].value++;
        else ratingDist[3].value++;
      });

      setFavStats({
        total: res.data.total,
        byCategory: Object.entries(catCount).map(([name, value]) => ({ name, value })),
        byRating: ratingDist.filter((d) => d.value > 0),
      });
    });
  }, []);

  return (
    <div className="container">
      <div className={styles.hero}>
        <h1>Bem-vindo ao Receita Fácil</h1>
        <p>Explore receitas do mundo inteiro e salve suas favoritas</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <FiHeart className={styles.statIcon} />
          <div>
            <span className={styles.statNumber}>{favStats.total}</span>
            <span className={styles.statLabel}>Favoritas</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiSearch className={styles.statIcon} />
          <div>
            <span className={styles.statNumber}>{categories.length}</span>
            <span className={styles.statLabel}>Categorias</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiGlobe className={styles.statIcon} />
          <div>
            <span className={styles.statNumber}>
              {categoryStats.reduce((sum, c) => sum + c.receitas, 0)}
            </span>
            <span className={styles.statLabel}>Receitas Disponiveis</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3>Receitas por Categoria (TheMealDB)</h3>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value) => [`${value} receitas`, 'Quantidade']} />
                <Bar dataKey="receitas" radius={[0, 4, 4, 0]}>
                  {categoryStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.chartLoading}>Carregando dados...</div>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3>Suas Favoritas por Categoria</h3>
          {favStats.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={favStats.byCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {favStats.byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.chartEmpty}>
              <FiHeart size={32} />
              <p>Adicione receitas aos favoritos para ver estatisticas</p>
            </div>
          )}
        </div>
      </div>

      {favStats.byRating.length > 0 && (
        <div className={styles.chartsRow}>
          <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
            <h3>Distribuicao de Avaliacoes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={favStats.byRating}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} receita(s)`, 'Quantidade']} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Categorias</h2>
          <button onClick={() => navigate('/search')} className={styles.seeAll}>Ver todas</button>
        </div>
        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={styles.categoryCard}
              onClick={() => navigate(`/search?category=${cat.name}`)}
            >
              <img src={cat.image_url} alt={cat.name} />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Receitas em Destaque</h2>
        </div>
        <div className={styles.featuredGrid}>
          {featured.map((meal) => (
            <div key={meal.id} className={styles.featuredCard} onClick={() => navigate(`/search?q=${meal.name}`)}>
              <img src={meal.image_url} alt={meal.name} />
              <div className={styles.featuredOverlay}>
                <span>{meal.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
