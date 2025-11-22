import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Wait for user state to update
        setTimeout(() => {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const role = storedUser.role;

          // Redirect based on role
          if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (role === 'PROFESSIONAL') {
            navigate('/professional/dashboard');
          } else {
            navigate('/client/landing');
          }
        }, 100);
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setLoading(true);

    try {
      const result = await login(userEmail, userPassword);
      if (result.success) {
        setTimeout(() => {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const role = storedUser.role;

          if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (role === 'PROFESSIONAL') {
            navigate('/professional/dashboard');
          } else {
            navigate('/client/landing');
          }
        }, 100);
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TurnoApp</h1>
          <p className="text-gray-600">Sistema de Gestión de Turnos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={loading}
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Demo - Acceso rápido:</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              fullWidth
              disabled={loading}
              onClick={() => handleQuickLogin('admin@turnoapp.com', 'admin123')}
            >
              Ingresar como Admin
            </Button>
            <Button
              variant="outline"
              fullWidth
              disabled={loading}
              onClick={() => handleQuickLogin('maria@psicologia.com', '123456')}
            >
              Ingresar como Profesional
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Usuarios de prueba:</p>
          <p className="mt-1">Admin: admin@turnoapp.com / admin123</p>
          <p>Profesional: maria@psicologia.com / 123456</p>
        </div>
      </Card>
    </div>
  );
};
