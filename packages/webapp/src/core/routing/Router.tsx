import { Routes, Route } from 'react-router-dom';

import MobileRouter from './MobileRouter';
import DesktopRouter from './DesktopRouter';

export const AppRouter = () => {
  return (
      <Routes>
        <Route path="/admin/*" element={<DesktopRouter />} />
        <Route path="/*" element={<MobileRouter />} />
      </Routes>
  );
}; 