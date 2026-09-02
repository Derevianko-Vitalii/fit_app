import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import styles from './NotFoundPage.module.scss';

/** Сторінка 404. */
function NotFoundPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code} aria-hidden="true">
        404
      </span>

      <h1 className={styles.title}>Сторінку не знайдено</h1>

      <p className={styles.text}>
        Схоже, ця сторінка втекла на пробіжку. Спробуйте повернутись до стрічки.
      </p>

      <Link to={ROUTES.home}>
        <Button size="lg">На головну</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
