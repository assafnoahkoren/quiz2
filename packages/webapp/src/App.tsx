import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { AppRouter } from './core/routing/Router';
import { MantineProvider, DirectionProvider } from '@mantine/core';

function App() {
  return (
    <DirectionProvider initialDirection="rtl" detectDirection>
      <MantineProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </MantineProvider>
    </DirectionProvider>
  );
}

export default App; 