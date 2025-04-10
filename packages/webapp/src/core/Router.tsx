import { RouterProvider, createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { PrivateRoute } from '../components/auth/PrivateRoute';
import { Layout } from '../components/Layout';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { Home } from '../pages/private/Home';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
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

const router = createBrowserRouter(routes);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
}; 