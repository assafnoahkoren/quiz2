import { AuthProvider } from './components/auth/AuthContext';
import { AppRouter } from './core/Router';
import { MantineProvider } from '@mantine/core';

// Import Mantine styles
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App; 