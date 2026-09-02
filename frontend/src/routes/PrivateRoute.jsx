import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

/**
 * Захищає маршрути, доступні лише авторизованим користувачам.
 * Поки триває відновлення сесії з localStorage — показує лоадер,
 * інакше користувача встигне "викинути" на /login при перезавантаженні.
 */
function PrivateRoute() {
  const { isAuthenticated, isBootstrapped } = useAuth();
  const location = useLocation();

  if (!isBootstrapped) return <Spinner size="lg" />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;
