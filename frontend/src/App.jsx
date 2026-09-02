import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import ToastContainer from '@/components/ui/Toast';
import { logout, restoreSession } from '@/store/auth/authSlice';
import { clearGoals, loadGoals } from '@/store/goals/goalsSlice';
import { showToast } from '@/store/ui/uiSlice';
import { setUnauthorizedHandler } from '@/api/httpClient';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import { storage } from '@/utils/storage';


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (storage.get(STORAGE_KEYS.token)) {
      dispatch(restoreSession());
    }
  }, [dispatch]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(logout());
      dispatch(clearGoals());
      dispatch(showToast('Сесія завершилась. Увійдіть знову.', 'error'));
      navigate(ROUTES.login);
    });

    return () => setUnauthorizedHandler(null);
  }, [dispatch, navigate]);

  useEffect(() => {
    dispatch(loadGoals(user?._id ?? null));
  }, [dispatch, user?._id]);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
