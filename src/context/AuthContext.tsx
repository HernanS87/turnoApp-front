import { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { LoginResponse, UserRole } from '../types/api';
import { getErrorMessage } from '../utils/errorHandler';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
}

interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  professionalId: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on init
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser({
        id: storedUser.userId,
        email: storedUser.email,
        firstName: storedUser.firstName,
        lastName: storedUser.lastName,
        role: storedUser.role,
        professionalId: storedUser.professionalId,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await authService.login({ email, password });

      const userData: AuthUser = {
        id: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        professionalId: response.professionalId,
      };

      authService.saveAuthData(response);
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Credenciales inválidas');
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response: LoginResponse = await authService.register(data);

      const userData: AuthUser = {
        id: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        professionalId: response.professionalId,
      };

      authService.saveAuthData(response);
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Error al registrar usuario');
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
