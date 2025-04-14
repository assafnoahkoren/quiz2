import { lazy, Suspense, useEffect, useState } from 'react';

const MobileRouter = lazy(() => import('./MobileRouter'));
const DesktopRouter = lazy(() => import('./DesktopRouter'));

const MOBILE_BREAKPOINT = 768; // Standard mobile breakpoint

export const AppRouter = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only check on startup
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isMobile ? <MobileRouter /> : <DesktopRouter />}
    </Suspense>
  );
}; 