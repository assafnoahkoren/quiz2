import { AuthProvider } from './components/auth/AuthContext';
import { AppRouter } from './core/routing/Router';
import { MantineProvider, DirectionProvider } from '@mantine/core';

function App() {
  return (
    <DirectionProvider initialDirection="rtl" detectDirection>
      <MantineProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </MantineProvider>
    </DirectionProvider>
  );
}

export default App; 