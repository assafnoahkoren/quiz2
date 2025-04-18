import { RouterProvider, createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';
import { DesktopLayout } from '../../pages/desktop/Layout';
import { Home } from '../../pages/desktop/Home';
import { GovExam } from '../../pages/desktop/GovExam';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import UsersPage from '../../pages/desktop/users/UsersPage';

const desktopRoutes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  // Private routes
  {
    path: '/', // All subsequent routes require auth check via PrivateRoute
    element: <PrivateRoute />,
    children: [
      {
        // Apply layout ONLY to authenticated routes
        element: <DesktopLayout />,
        children: [
          {
            index: true, // Matches '/' path inside the layout
            element: <Home />,
          },
          {
            path: 'gov-exam/:govExamId',
            element: <GovExam />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          // Fallback for authenticated but unmatched routes within the layout
          {
            path: '*',
            element: <Navigate to="/" replace />,
          },
        ],
      },
    ],
  },
  // Top-level fallback for any routes not matched above
  {
    path: '*',
    // Redirecting to '/' handles the auth check and directs to either login or home
    element: <Navigate to="/" replace />,
  },
];

const desktopRouter = createBrowserRouter(desktopRoutes);

const DesktopRouter = () => {
  return <RouterProvider router={desktopRouter} />;
};

export default DesktopRouter; 