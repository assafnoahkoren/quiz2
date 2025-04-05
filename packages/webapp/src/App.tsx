import { AuthProvider } from './components/auth/AuthContext';
import { AppRouter } from './core/Router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App; 