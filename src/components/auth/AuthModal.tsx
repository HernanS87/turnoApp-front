import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import authService from '../../services/authService';
import { getErrorMessage } from '../../utils/errorHandler';
import { toast } from 'react-toastify';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'login' | 'register';

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!loginData.email || !loginData.password) {
      setError('Por favor completá todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(loginData);

      // Validate role is CLIENT
      if (response.role !== 'CLIENT') {
        setError('Solo los clientes pueden agendar turnos. Por favor iniciá sesión con una cuenta de cliente.');
        setLoading(false);
        return;
      }

      authService.saveAuthData(response);
      toast.success('¡Bienvenido!');
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Error al iniciar sesión'));
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
      setError('Por favor completá todos los campos');
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
      const response = await authService.register(registerData);
      authService.saveAuthData(response);
      toast.success('¡Cuenta creada exitosamente!');
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ email: '', password: '', firstName: '', lastName: '', phone: '', birthDate: '', province: '', city: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
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

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {activeTab === 'login' ? 'Iniciá sesión para continuar' : 'Creá tu cuenta'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                type="text"
                placeholder="Juan"
                value={registerData.firstName}
                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                required
              />
              <Input
                label="Apellido"
                type="text"
                placeholder="Pérez"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder="261-555-1234"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              required
            />
            <Input
              label="Fecha de nacimiento"
              type="date"
              value={registerData.birthDate}
              onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Provincia</label>
                <select
                  value={registerData.province}
                  onChange={(e) => setRegisterData({ ...registerData, province: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              />
            </div>
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              Al crear una cuenta aceptás nuestros términos y condiciones
            </p>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        )}

        <div className="text-center">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};
