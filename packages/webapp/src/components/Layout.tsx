import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main>
        <Outlet />
      </main>
    </div>
  );
}; 