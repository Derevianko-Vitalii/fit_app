import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Стрічка', icon: '🏠', public: true },
  { to: ROUTES.awards, label: 'Досягнення', icon: '🏆', public: true },
  { to: ROUTES.progress, label: 'Прогрес', icon: '📈', public: false },
  { to: ROUTES.account, label: 'Мій профіль', icon: '👤', public: false },
  { to: ROUTES.settings, label: 'Налаштування', icon: '⚙️', public: false },
];

/** Бічна навігація. На вузьких екранах перетворюється на висувну шухляду. */
function Sidebar() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isSidebarOpen);
  const { isAuthenticated } = useAuth();

  const items = NAV_ITEMS.filter((item) => item.public || isAuthenticated);

  const close = () => dispatch(toggleSidebar(false));

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={close} aria-hidden="true" />}

      <aside className={[styles.sidebar, isOpen ? styles.open : ''].filter(Boolean).join(' ')}>
        <nav className={styles.nav}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.home}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
              onClick={close}
            >
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.footerText}>FitApp — тримай форму разом з іншими 💪</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
