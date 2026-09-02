import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setSearchQuery } from '@/store/ui/uiSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/constants';
import styles from './SearchBar.module.scss';

/**
 * Глобальний пошук. Локальний стан поля дебаунситься
 * і лише потім потрапляє в Redux, звідки його читає стрічка.
 */
function SearchBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const storeQuery = useSelector((state) => state.ui.searchQuery);

  const [value, setValue] = useState(storeQuery);
  const [syncedQuery, setSyncedQuery] = useState(storeQuery);
  const debouncedValue = useDebounce(value, 400);

  if (storeQuery !== syncedQuery) {
    setSyncedQuery(storeQuery);
    setValue(storeQuery);
  }

  useEffect(() => {
    dispatch(setSearchQuery(debouncedValue));
  }, [debouncedValue, dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(setSearchQuery(value));

    if (location.pathname !== ROUTES.home) {
      navigate(ROUTES.home);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <span className={styles.icon} aria-hidden="true">
        🔍
      </span>

      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Пошук публікацій та користувачів…"
        aria-label="Пошук"
      />

      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => setValue('')}
          aria-label="Очистити пошук"
        >
          ×
        </button>
      )}
    </form>
  );
}

export default SearchBar;
