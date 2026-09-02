import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/layout/AuthLayout';
import PrivateRoute from './PrivateRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import Spinner from '@/components/ui/Spinner';
import HomePage from '@/pages/Home/HomePage';

const AccountPage = lazy(() => import('@/pages/Account/AccountPage'));
const AccountSettingsPage = lazy(() => import('@/pages/AccountSettings/AccountSettingsPage'));
const AwardsPage = lazy(() => import('@/pages/Awards/AwardsPage'));
const ProgressPage = lazy(() => import('@/pages/Progress/ProgressPage'));
const PostDetailsPage = lazy(() => import('@/pages/PostDetails/PostDetailsPage'));
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const SignUpPage = lazy(() => import('@/pages/Auth/SignUpPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

/** Карта маршрутів застосунку. */
function AppRoutes() {
  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <Routes>
        {/* Сторінки входу та реєстрації — окремий каркас без хедера */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>
        </Route>

        {/* Основний каркас застосунку */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/awards" element={<AwardsPage />} />
          <Route path="/posts/:id" element={<PostDetailsPage />} />
          <Route path="/account/:id" element={<AccountPage />} />

          {/* Маршрути лише для авторизованих */}
          <Route element={<PrivateRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/settings" element={<AccountSettingsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
