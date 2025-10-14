import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { UserRole } from '../types';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);

    if (result.success && result.user) {
      // Redirect based on role
      if (result.user.role === 'professional') {
        navigate('/professional/dashboard');
      } else {
        navigate('/client/landing');
      }
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  const handleQuickLogin = (userEmail: string, userRole: UserRole) => {
    setEmail(userEmail);
    setPassword('123456');

    setTimeout(() => {
      const result = login(userEmail, '123456');
      if (result.success && result.user) {
        if (result.user.role === 'professional') {
          navigate('/professional/dashboard');
        } else {
          navigate('/client/landing');
        }
      }
    }, 100);
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
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth>
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Demo - Acceso rápido:</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleQuickLogin('maria@psicologia.com', 'professional')}
            >
              Ingresar como Profesional
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleQuickLogin('juan@mail.com', 'client')}
            >
              Ingresar como Cliente
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Usuarios de prueba - Contraseña: 123456</p>
          <p className="mt-1">Profesional: maria@psicologia.com</p>
          <p>Cliente: juan@mail.com, ana@mail.com, pedro@mail.com</p>
        </div>
      </Card>
    </div>
  );
};
