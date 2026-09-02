import { useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useToggle } from '@/hooks/useToggle';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { logout } from '@/store/auth/authSlice';
import { clearGoals } from '@/store/goals/goalsSlice';
import { toggleSidebar } from '@/store/ui/uiSlice';
import { ROUTES } from '@/constants';
import { getFullName } from '@/utils/formatters';
import SearchBar from '@/components/search/SearchBar';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import styles from './Header.module.scss';

/** Верхня панель: логотип, глобальний пошук і меню користувача. */
function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, menu] = useToggle(false);

  const menuRef = useOutsideClick(menu.off, isMenuOpen);

  const handleLogout = useCallback(() => {
    menu.off();
    dispatch(logout());
    dispatch(clearGoals());
    navigate(ROUTES.login);
  }, [dispatch, menu, navigate]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.burger}
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Відкрити меню"
        >
          ☰
        </button>

        <Link to={ROUTES.home} className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            ⚡
          </span>
          <span className={styles.logoText}>FitApp</span>
        </Link>

        <div className={styles.search}>
          <SearchBar />
        </div>

        <nav className={styles.nav}>
          {isAuthenticated ? (
            <div className={styles.userMenu} ref={menuRef}>
              <button
                type="button"
                className={styles.userButton}
                onClick={menu.toggle}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
              >
                <Avatar user={user} size="sm" />
                <span className={styles.userName}>{getFullName(user)}</span>
              </button>

              {isMenuOpen && (
                <div className={styles.dropdown} role="menu">
                  <NavLink to={ROUTES.account} className={styles.dropdownItem} onClick={menu.off}>
                    Мій профіль
                  </NavLink>
                  <NavLink to={ROUTES.settings} className={styles.dropdownItem} onClick={menu.off}>
                    Налаштування
                  </NavLink>
                  <NavLink to={ROUTES.progress} className={styles.dropdownItem} onClick={menu.off}>
                    Мій прогрес
                  </NavLink>
                  <hr className={styles.divider} />
                  <button
                    type="button"
                    className={[styles.dropdownItem, styles.logout].join(' ')}
                    onClick={handleLogout}
                  >
                    Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authActions}>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.login)}>
                Увійти
              </Button>
              <Button size="sm" onClick={() => navigate(ROUTES.signup)}>
                Реєстрація
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
