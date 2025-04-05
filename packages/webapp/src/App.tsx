import { AuthProvider } from './components/auth/AuthContext';
import { AppRouter } from './core/Router';
import { MantineProvider, DirectionProvider } from '@mantine/core';

// Import Mantine styles
import '@mantine/core/styles.css';

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