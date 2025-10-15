import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Client } from '../types';
import { USERS } from '../data/users';
import { CLIENTS } from '../data/clients';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string; user?: User };
  register: (data: RegisterData) => { success: boolean; error?: string; user?: User };
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on init
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Get stored users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');

    // Search in both hardcoded and stored users
    const allUsers = [...USERS, ...storedUsers];
    const foundUser = allUsers.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        password: foundUser.password,
        role: foundUser.role,
        professionalId: foundUser.professionalId,
        clientId: foundUser.clientId
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, error: 'Credenciales inválidas' };
  };

  const register = (data: RegisterData) => {
    // Get stored users and clients from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const storedClients = JSON.parse(localStorage.getItem('clients') || '[]');

    // Check if email already exists in both hardcoded and stored users
    const allUsers = [...USERS, ...storedUsers];
    const existingUser = allUsers.find(u => u.email === data.email);
    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Generate new IDs
    const allClients = [...CLIENTS, ...storedClients];
    const newUserId = allUsers.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newClientId = allClients.reduce((max, c) => Math.max(max, c.id), 0) + 1;

    // Create new client
    const newClient: Client = {
      id: newClientId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      birthDate: '', // Optional field, can be filled later
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    };

    // Create new user
    const newUser: User = {
      id: newUserId,
      email: data.email,
      password: data.password,
      role: 'client',
      clientId: newClientId
    };

    // Save to localStorage
    storedUsers.push(newUser);
    storedClients.push(newClient);
    localStorage.setItem('users', JSON.stringify(storedUsers));
    localStorage.setItem('clients', JSON.stringify(storedClients));

    // Auto-login
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));

    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
