import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const MobileRouter = lazy(() => import('./MobileRouter'));
const DesktopRouter = lazy(() => import('./DesktopRouter'));

export const AppRouter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/admin/*" element={<DesktopRouter />} />
        <Route path="/*" element={<MobileRouter />} />
      </Routes>
    </Suspense>
  );
}; 