import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import serviceService from '../../services/serviceService';
import { ServiceResponse } from '../../types/api';
import { Briefcase, Plus, Edit, Trash2, DollarSign, Clock, Percent, Power } from 'lucide-react';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/errorHandler';

export const ManageServicesPage = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    requiresDeposit: false,
    depositPercentage: 0,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (error: any) {
      toast.error('Error al cargar servicios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: ServiceResponse) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        requiresDeposit: service.depositPercentage > 0,
        depositPercentage: service.depositPercentage,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        requiresDeposit: false,
        depositPercentage: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (formData.name.trim() === '') {
      toast.error('El nombre del servicio es obligatorio');
      return;
    }

    if (formData.price <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (formData.duration <= 0) {
      toast.error('La duración debe ser mayor a 0');
      return;
    }

    if (formData.requiresDeposit && (formData.depositPercentage < 0 || formData.depositPercentage > 100)) {
      toast.error('El porcentaje de seña debe estar entre 0 y 100');
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        depositPercentage: formData.requiresDeposit ? formData.depositPercentage : 0,
      };

      if (editingService) {
        await serviceService.updateService(editingService.id, serviceData);
        toast.success('Servicio actualizado exitosamente');
      } else {
        await serviceService.createService(serviceData);
        toast.success('Servicio creado exitosamente');
      }
      await loadServices();
      handleCloseModal();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Error al guardar servicio'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      await serviceService.deleteService(id);
      toast.success('Servicio eliminado exitosamente');
      await loadServices();
    } catch (error: any) {
      toast.error('Error al eliminar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    setLoading(true);
    try {
      await serviceService.toggleServiceStatus(id);
      toast.success('Estado del servicio actualizado exitosamente');
      await loadServices();
    } catch {
      toast.error('Error al actualizar estado del servicio');
    } finally {
      setLoading(false);
    }
  };

  const activeServices = services.filter(s => s.status === 'ACTIVE');
  const inactiveServices = services.filter(s => s.status === 'INACTIVE');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">Gestión de Servicios</h1>
              <p className="text-gray-600">Administrá los servicios que ofrecés</p>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus size={16} className="inline mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Servicios</p>
                <p className="text-3xl font-bold text-gray-800">{services.length}</p>
              </div>
              <Briefcase className="text-blue-500" size={32} />
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-gray-800">{activeServices.length}</p>
              </div>
              <Power className="text-green-500" size={32} />
            </div>
          </Card>

          <Card className="border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Precio Promedio</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${activeServices.length > 0
                    ? Math.round(activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length).toLocaleString('es-AR')
                    : 0
                  }
                </p>
              </div>
              <DollarSign className="text-yellow-500" size={32} />
            </div>
          </Card>
        </div>

        {/* Active Services */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Servicios Activos</h2>
          </div>

          {loading && <p className="text-gray-500">Cargando...</p>}

          {!loading && activeServices.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay servicios activos</p>
              <Button variant="primary" onClick={() => handleOpenModal()} className="mt-4">
                Crear primer servicio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeServices.map(service => (
                <div
                  key={service.id}
                  className="p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(service.id)}
                        className="p-2 text-green-600 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                        title="Desactivar"
                        disabled={loading}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(service)}
                        className="p-2 text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                        title="Editar"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                        title="Eliminar"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">{service.description}</p>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-700">
                      <DollarSign size={16} className="text-primary" />
                      <span className="font-semibold">${service.price.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700">
                      <Clock size={16} className="text-primary" />
                      <span>{service.duration} min</span>
                    </div>
                    {service.depositPercentage > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 text-yellow-700 rounded bg-yellow-50">
                        <Percent size={16} />
                        <span>Seña {service.depositPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Inactive Services */}
        {inactiveServices.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Power className="text-gray-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Servicios Inactivos</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {inactiveServices.map(service => (
                <div
                  key={service.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-70"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-600">{service.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(service.id)}
                        className="p-2 text-gray-600 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                        title="Activar"
                        disabled={loading}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                        title="Eliminar"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>${service.price.toLocaleString('es-AR')}</span>
                    <span>•</span>
                    <span>{service.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Nombre del Servicio *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Consulta Individual"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Describe el servicio..."
                disabled={loading}
              />
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Precio ($) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="100"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Duración (min) *
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  step="1"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Deposit Settings */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="requiresDeposit"
                  checked={formData.requiresDeposit}
                  onChange={(e) => setFormData({
                    ...formData,
                    requiresDeposit: e.target.checked,
                    depositPercentage: e.target.checked ? formData.depositPercentage || 50 : 0
                  })}
                  className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                  disabled={loading}
                />
                <label htmlFor="requiresDeposit" className="text-sm font-medium text-gray-700">
                  Requiere seña
                </label>
              </div>

              {formData.requiresDeposit && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Porcentaje de seña (%)
                  </label>
                  <Input
                    type="number"
                    value={formData.depositPercentage}
                    onChange={(e) => setFormData({ ...formData, depositPercentage: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="5"
                    disabled={loading}
                  />
                  {formData.price > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Seña: ${Math.round(formData.price * formData.depositPercentage / 100).toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal} fullWidth disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear Servicio'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
