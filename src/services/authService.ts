import api from './api';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  saveAuthData(data: LoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      professionalId: data.professionalId,
      province: data.province,
      city: data.city,
    }));
  }

  getStoredUser(): LoginResponse | null {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) return null;

    try {
      const user = JSON.parse(userStr);
      return { ...user, token, userId: user.id };
    } catch {
      return null;
    }
  }
}

export default new AuthService();