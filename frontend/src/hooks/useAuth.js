import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectIsBootstrapped,
} from '@/store/auth/authSelectors';

/**
 * Зручний доступ до стану авторизації в компонентах.
 * @returns {{ user: object|null, isAuthenticated: boolean, isAdmin: boolean,
 *   isLoading: boolean, isBootstrapped: boolean }}
 */
export function useAuth() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isLoading = useSelector(selectAuthLoading);
  const isBootstrapped = useSelector(selectIsBootstrapped);

  return { user, isAuthenticated, isAdmin, isLoading, isBootstrapped };
}
