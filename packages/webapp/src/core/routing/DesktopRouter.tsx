import { RouterProvider, createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';
import { DesktopLayout } from '../../pages/desktop/Layout';
import { Home } from '../../pages/desktop/Home';
import { GovExam } from '../../pages/desktop/GovExam';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';

const desktopRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DesktopLayout />,
    children: [
      // Public routes
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      // Protected routes
      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
          {
            path: 'gov-exam/:govExamId',
            element: <GovExam />,
          },
        ],
      },
      // Fallback route
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

const desktopRouter = createBrowserRouter(desktopRoutes);

const DesktopRouter = () => {
  return <RouterProvider router={desktopRouter} />;
};

export default DesktopRouter; 