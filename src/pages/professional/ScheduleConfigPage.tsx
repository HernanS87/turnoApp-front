import { useState, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  getAllScheduleSlots,
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  toggleScheduleSlotActive,
  validateNoOverlap,
  resetScheduleToDefaults
} from '../../utils/scheduleStorage';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock, Plus, Trash2, Power, RotateCcw, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { ScheduleSlot } from '../../types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', shortLabel: 'Dom' },
  { value: 1, label: 'Lunes', shortLabel: 'Lun' },
  { value: 2, label: 'Martes', shortLabel: 'Mar' },
  { value: 3, label: 'Miércoles', shortLabel: 'Mié' },
  { value: 4, label: 'Jueves', shortLabel: 'Jue' },
  { value: 5, label: 'Viernes', shortLabel: 'Vie' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' }
];

export const ScheduleConfigPage = () => {
  const { user } = useAuth();
  const professionalId = user?.professionalId || 1;
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>(getAllScheduleSlots(professionalId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '13:00',
    active: true
  });

  // Group slots by day
  const slotsByDay = useMemo(() => {
    const grouped: { [key: number]: ScheduleSlot[] } = {};
    DAYS_OF_WEEK.forEach(day => {
      grouped[day.value] = scheduleSlots
        .filter(slot => slot.dayOfWeek === day.value)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [scheduleSlots]);

  const handleOpenModal = (slot?: ScheduleSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: slot.active
      });
    } else {
      setEditingSlot(null);
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '13:00',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlot(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: end time must be after start time
    if (formData.endTime <= formData.startTime) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    // Validation: check for overlaps
    const isValid = validateNoOverlap(
      formData.dayOfWeek,
      formData.startTime,
      formData.endTime,
      editingSlot?.id,
      professionalId
    );

    if (!isValid) {
      toast.error('El horario se solapa con otro bloque existente');
      return;
    }

    if (editingSlot) {
      // Update existing slot
      const updated = updateScheduleSlot(editingSlot.id, formData, professionalId);
      if (updated) {
        setScheduleSlots(getAllScheduleSlots(professionalId));
        toast.success('Horario actualizado exitosamente');
        handleCloseModal();
      } else {
        toast.error('Error al actualizar el horario');
      }
    } else {
      // Create new slot
      const newSlot = createScheduleSlot(formData, professionalId);
      setScheduleSlots(getAllScheduleSlots(professionalId));
      toast.success('Horario agregado exitosamente');
      handleCloseModal();
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      const deleted = deleteScheduleSlot(id, professionalId);
      if (deleted) {
        setScheduleSlots(getAllScheduleSlots(professionalId));
        toast.success('Horario eliminado exitosamente');
      } else {
        toast.error('Error al eliminar el horario');
      }
    }
  };

  const handleToggleActive = (id: number) => {
    const success = toggleScheduleSlotActive(id, professionalId);
    if (success) {
      setScheduleSlots(getAllScheduleSlots(professionalId));
      toast.success('Estado actualizado');
    } else {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Estás seguro de restaurar la configuración por defecto? Se perderán todos los cambios.')) {
      resetScheduleToDefaults(professionalId);
      setScheduleSlots(getAllScheduleSlots(professionalId));
      toast.success('Configuración restaurada');
    }
  };

  const getDayLabel = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración de Agenda</h1>
              <p className="text-gray-600">Definí tus horarios de atención semanales</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleResetToDefaults}>
                <RotateCcw size={16} className="inline mr-2" />
                Restaurar Defaults
              </Button>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Plus size={16} className="inline mr-2" />
                Agregar Horario
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DAYS_OF_WEEK.map(day => {
            const daySlots = slotsByDay[day.value];
            const hasSlots = daySlots.length > 0;
            const activeSlots = daySlots.filter(s => s.active);

            return (
              <Card key={day.value} className={!hasSlots ? 'bg-gray-50' : ''}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">{day.label}</h2>
                  </div>
                  {hasSlots && (
                    <span className="text-sm text-gray-600">
                      {activeSlots.length} {activeSlots.length === 1 ? 'bloque activo' : 'bloques activos'}
                    </span>
                  )}
                </div>

                {!hasSlots ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin horarios configurados</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({ ...formData, dayOfWeek: day.value });
                        handleOpenModal();
                      }}
                      className="mt-4 text-sm"
                    >
                      <Plus size={14} className="inline mr-1" />
                      Agregar horario
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySlots.map(slot => (
                      <div
                        key={slot.id}
                        className={`border rounded-lg p-3 ${
                          slot.active
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock size={18} className={slot.active ? 'text-green-600' : 'text-gray-400'} />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-xs text-gray-600">
                                {calculateDuration(slot.startTime, slot.endTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(slot.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                slot.active
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title={slot.active ? 'Desactivar' : 'Activar'}
                            >
                              <Power size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenModal(slot)}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingSlot ? 'Editar Horario' : 'Agregar Horario'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Day of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Día de la Semana
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Horario activo
              </label>
            </div>

            {/* Duration Preview */}
            {formData.startTime && formData.endTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <Clock size={14} className="inline mr-1" />
                  Duración: {calculateDuration(formData.startTime, formData.endTime)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal} fullWidth>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                {editingSlot ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

// Helper function to calculate duration
function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const diffMinutes = endMinutes - startMinutes;

  if (diffMinutes <= 0) return '0 min';

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}
