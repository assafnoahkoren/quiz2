import { lazy, Suspense, useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768; // Standard mobile breakpoint

const MobileRouter = lazy(() => import('./MobileRouter'));
const DesktopRouter = lazy(() => import('./DesktopRouter'));

export const AppRouter = () => {
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isMobile ? <MobileRouter /> : <DesktopRouter />}
    </Suspense>
  );
}; 