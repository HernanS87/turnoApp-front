import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

type TabType = 'login' | 'register';

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    province: '',
    city: ''
  });

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
        setError(result.error || 'El email o la contraseña son incorrectos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!registerData.email || !registerData.password || !registerData.firstName ||
        !registerData.lastName || !registerData.phone || !registerData.birthDate) {
      setError('Por favor completá todos los campos obligatorios');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Por favor ingresá un email válido');
      setLoading(false);
      return;
    }

    // Password validation
    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await register(registerData);
      if (result.success) {
        setTimeout(() => {
          navigate('/client/dashboard');
        }, 100);
      } else {
        setError(result.error || 'Error al registrarse');
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
        setError(result.error || 'El email o la contraseña son incorrectos');
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">TurnoApp</h1>
          <p className="text-gray-600">Sistema de Gestión de Turnos</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'login'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'register'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
          >
            Crear cuenta
          </button>
        </div>

        {/* Error message - outside animated container to prevent disappearing */}
        {error && activeTab === 'login' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Animated Forms Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(${activeTab === 'login' ? '0%' : '-50%'})`,
              width: '200%'
            }}
          >
            {/* Login Form - First Slide */}
            <div className="w-1/2 flex-shrink-0 px-0">
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

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>

              {/* Demo section - only show on login tab */}
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
            </div>

            {/* Register Form - Second Slide */}
            <div className="w-1/2 flex-shrink-0 px-0">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nombre"
                    type="text"
                    placeholder="Juan"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <Input
                    label="Apellido"
                    type="text"
                    placeholder="Pérez"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  disabled={loading}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="261-555-1234"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  required
                  disabled={loading}
                />
                <Input
                  label="Fecha de nacimiento"
                  type="date"
                  value={registerData.birthDate}
                  onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                  required
                  disabled={loading}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Provincia</label>
                    <select
                      value={registerData.province}
                      onChange={(e) => setRegisterData({ ...registerData, province: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    >
                      <option value="">Seleccionar provincia</option>
                      <option value="Buenos Aires">Buenos Aires</option>
                      <option value="Catamarca">Catamarca</option>
                      <option value="Chaco">Chaco</option>
                      <option value="Chubut">Chubut</option>
                      <option value="Córdoba">Córdoba</option>
                      <option value="Corrientes">Corrientes</option>
                      <option value="Entre Ríos">Entre Ríos</option>
                      <option value="Formosa">Formosa</option>
                      <option value="Jujuy">Jujuy</option>
                      <option value="La Pampa">La Pampa</option>
                      <option value="La Rioja">La Rioja</option>
                      <option value="Mendoza">Mendoza</option>
                      <option value="Misiones">Misiones</option>
                      <option value="Neuquén">Neuquén</option>
                      <option value="Río Negro">Río Negro</option>
                      <option value="Salta">Salta</option>
                      <option value="San Juan">San Juan</option>
                      <option value="San Luis">San Luis</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Santa Fe">Santa Fe</option>
                      <option value="Santiago del Estero">Santiago del Estero</option>
                      <option value="Tierra del Fuego">Tierra del Fuego</option>
                      <option value="Tucumán">Tucumán</option>
                    </select>
                  </div>
                  <Input
                    label="Ciudad"
                    type="text"
                    placeholder="Ciudad"
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Al crear una cuenta aceptás nuestros términos y condiciones
                </p>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Error message for register - outside animated container */}
        {error && activeTab === 'register' && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
};
