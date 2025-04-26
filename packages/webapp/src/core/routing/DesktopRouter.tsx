import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';
import { DesktopLayout } from '../../pages/desktop/Layout';
import { Home } from '../../pages/desktop/Home';
import { GovExam } from '../../pages/desktop/GovExam';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import UsersPage from '../../pages/desktop/users/UsersPage';
import { MantineProvider } from '@mantine/core';

const DesktopRouter = () => {
  // Note: The base path '/admin' is handled in AppRouter.tsx
  // These paths are relative to '/admin'
  return (
    <MantineProvider>
      <Routes>
        {/* Public routes (relative to /admin) */}
        {/* These might not be reachable if /admin requires auth, depending on PrivateRoute logic */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Private routes (relative to /admin) */}
        <Route element={<PrivateRoute />}>
          <Route element={<DesktopLayout />}>
            <Route index element={<Home />} />
            <Route path="gov-exam/:govExamId" element={<GovExam />} />
            <Route path="users" element={<UsersPage />} />
            {/* Fallback within /admin */}
            <Route path="*" element={<Navigate to="." replace />} />
          </Route>
        </Route>

        {/* Top-level fallback within /admin - redundant if PrivateRoute covers all */}
        {/* <Route path="*" element={<Navigate to="." replace />} /> */}
      </Routes>
    </MantineProvider>
  );
};

export default DesktopRouter; 