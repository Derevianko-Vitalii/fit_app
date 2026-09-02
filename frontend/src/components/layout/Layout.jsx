import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './Layout.module.scss';

/**
 * Загальний каркас застосунку: хедер зверху, бічне меню зліва,
 * контент сторінки — через <Outlet /> React Router.
 */
function Layout() {
  return (
    <div className={styles.layout}>
      <Header />

      <div className={styles.body}>
        <Sidebar />

        <main className={styles.main}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
