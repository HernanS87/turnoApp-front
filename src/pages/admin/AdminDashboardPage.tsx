import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import adminService from '../../services/adminService';
import { ProfessionalResponse, CreateProfessionalRequest } from '../../types/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'professionals' | 'clients'>('professionals');
  const [professionals, setProfessionals] = useState<ProfessionalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateProfessionalRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    profession: '',
    customUrl: '',
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    loadProfessionals();
  }, [user, navigate]);

  const loadProfessionals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllProfessionals();
      setProfessionals(data);
    } catch (err: any) {
      setError('Error al cargar profesionales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (professional?: ProfessionalResponse) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({
        email: professional.email,
        password: '',
        firstName: professional.firstName,
        lastName: professional.lastName,
        phone: professional.phone,
        profession: professional.profession,
        customUrl: professional.customUrl,
      });
    } else {
      setEditingProfessional(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        profession: '',
        customUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProfessional(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      profession: '',
      customUrl: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingProfessional) {
        // Update
        await adminService.updateProfessional(editingProfessional.id, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profession: formData.profession,
          customUrl: formData.customUrl,
        });
      } else {
        // Create
        await adminService.createProfessional(formData);
      }
      await loadProfessionals();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar profesional');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    setLoading(true);
    try {
      await adminService.toggleProfessionalStatus(id);
      await loadProfessionals();
    } catch (err: any) {
      setError('Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-sm text-gray-600">Bienvenido, {user?.firstName}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('professionals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'professionals'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profesionales
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clientes
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Professionals Tab */}
        {activeTab === 'professionals' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profesionales</h2>
              <Button onClick={() => handleOpenModal()}>
                + Crear Profesional
              </Button>
            </div>

            {loading && <p className="text-gray-500">Cargando...</p>}

            {!loading && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profesión
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {professionals.map((professional) => (
                      <tr key={professional.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {professional.firstName} {professional.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {professional.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {professional.profession}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {professional.customUrl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              professional.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {professional.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleOpenModal(professional)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleStatus(professional.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            {professional.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Clientes</h2>
            <p className="text-gray-500">Funcionalidad pendiente de implementación</p>
          </Card>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingProfessional ? 'Editar Profesional' : 'Crear Profesional'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              {!editingProfessional && (
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              )}

              <Input
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <Input
                label="Profesión"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                required
              />

              <Input
                label="URL Personalizada"
                value={formData.customUrl}
                onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                placeholder="ej: maria-rodriguez"
                required
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={handleCloseModal} type="button">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
