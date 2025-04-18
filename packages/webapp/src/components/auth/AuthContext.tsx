import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  console.log('AuthProvider initializing');
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  
  console.log('AuthProvider initial state', { token, isAuthenticated });

  useEffect(() => {
    console.log('Token changed effect triggered', { token });
    if (token) {
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      console.log('User authenticated, token saved to localStorage');
    } else {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      console.log('User logged out, token removed from localStorage');
    }
  }, [token]);

  const login = (newToken: string) => {
    console.log('Login called with token', { tokenLength: newToken.length });
    setToken(newToken);
  };

  const logout = () => {
    console.log('Logout called');
    setToken(null);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 