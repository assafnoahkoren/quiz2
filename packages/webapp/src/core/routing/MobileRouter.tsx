import { RouterProvider, createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';
import { Layout } from '../../components/Layout';
import { Home } from '../../pages/mobile/Home';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import { MobileLayout } from '../../pages/mobile/MobileLayout';
import ExerciseComponent from '../../pages/mobile/exercise/ExerciseComponent';
import { ThankYouPage } from '../../pages/ThankYouPage';

// These components would need to be created
// const Exercise = () => <div>Exercise Page</div>;
const Exam = () => <div>Exam Page</div>;

const mobileRoutes: RouteObject[] = [
  // Public routes with Layout
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  // Protected routes with MobileLayout
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <MobileLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: 'exercise',
            element: <ExerciseComponent />,
          },
          {
            path: 'exam',
            element: <Exam />,
          },
          {
            path: 'thank-you',
            element: <ThankYouPage />,
          },
        ],
      },
    ],
  },
  // Fallback route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

const mobileRouter = createBrowserRouter(mobileRoutes);

const MobileRouter = () => {
  return <RouterProvider router={mobileRouter} />;
};

export default MobileRouter; 