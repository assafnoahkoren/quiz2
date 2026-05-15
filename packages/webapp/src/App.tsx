import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { AppRouter } from './core/routing/Router';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

function App() {
  return (
    <DirectionProvider initialDirection="rtl" detectDirection>
      <MantineProvider>
        <Notifications />
        <ModalsProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </DirectionProvider>
  );
}

export default App; 