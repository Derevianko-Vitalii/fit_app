import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

/** Не пускає вже авторизованого користувача на /login та /signup. */
function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapped } = useAuth();

  if (!isBootstrapped) return <Spinner size="lg" />;

  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />;

  return <Outlet />;
}

export default PublicOnlyRoute;
