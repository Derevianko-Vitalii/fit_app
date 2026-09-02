import { Component } from 'react';
import styles from './ErrorBoundary.module.scss';

/**
 * Ловить помилки рендеру в дереві React, щоб застосунок
 * не падав у білий екран. Класовий компонент — бо хуків
 * для error boundary у React досі немає.
 */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Помилка рендеру:', error, info);
  }

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={styles.wrapper} role="alert">
        <span className={styles.icon} aria-hidden="true">
          💥
        </span>

        <h1 className={styles.title}>Щось пішло не так</h1>

        <p className={styles.text}>
          Застосунок несподівано зупинився. Спробуйте перезавантажити сторінку.
        </p>

        <button type="button" className={styles.button} onClick={this.handleReload}>
          Перезавантажити
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
