import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';
import { Layout } from '../../components/Layout';
import { Home } from '../../pages/mobile/Home';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import { MobileLayout } from '../../pages/mobile/MobileLayout';
import ExerciseComponent from '../../pages/mobile/exercise/ExerciseComponent';
import { ThankYouPage } from '../../pages/ThankYouPage';
import QuestionPage from '../../pages/public/QuestionPage';
import ExamCreationPage from '../../pages/exam/ExamCreationPage';
import ExamPage from '../../pages/exam/ExamPage';

// These components would need to be created
// const Exercise = () => <div>Exercise Page</div>;

const MobileRouter = () => {
  return (
    <Routes>
      {/* Public routes with Layout */}
      <Route path="/" element={<Layout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="question/:id" element={<QuestionPage />} />
      </Route>

      {/* Protected routes with MobileLayout */}
      <Route element={<PrivateRoute />}>
        <Route element={<MobileLayout />}>
          <Route index element={<Home />} />
          <Route path="exercise" element={<ExerciseComponent />} />
          <Route path="exam/:id" element={<ExamPage />} />
          <Route path="create-exam" element={<ExamCreationPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
        </Route>
      </Route>

      {/* Fallback route - Adjusted for nested structure */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MobileRouter; 