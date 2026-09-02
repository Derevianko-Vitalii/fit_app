import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants';
import styles from './AuthLayout.module.scss';

/** Каркас для сторінок входу та реєстрації — без хедера й сайдбару. */
function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.promo}>
        <Link to={ROUTES.home} className={styles.logo}>
          <span aria-hidden="true">⚡</span> FitApp
        </Link>

        <h1 className={styles.promoTitle}>Твій прогрес — на видноті</h1>

        <p className={styles.promoText}>
          Став цілі, відзначай досягнення й ділись результатами зі спільнотою.
        </p>

        <ul className={styles.features}>
          <li>🏆 Нагороди за досягнуті цілі</li>
          <li>📈 Наочна візуалізація прогресу</li>
          <li>👥 Стрічка публікацій і підписки</li>
        </ul>
      </aside>

      <main className={styles.formArea}>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
