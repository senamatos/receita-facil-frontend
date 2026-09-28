import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiHeart } from 'react-icons/fi';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <NavLink to="/" className={styles.logo}>
          Receita Fácil
        </NavLink>
        <div className={styles.links}>
          <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
            <FiHome /> Dashboard
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? styles.active : ''}>
            <FiSearch /> Explorar
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? styles.active : ''}>
            <FiHeart /> Favoritos
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
