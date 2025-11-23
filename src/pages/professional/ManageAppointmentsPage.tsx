import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import appointmentService from '../../services/appointmentService';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock, User, Mail, FileText, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import type { AppointmentResponse, AppointmentStatus } from '../../types/api';

type StatusFilter = 'ALL' | AppointmentStatus | 'NO_SHOW';
type DateFilter = 'ALL' | 'PAST' | 'FUTURE' | 'TODAY';

export const ManageAppointmentsPage = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load appointments from API on mount
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        const data = await appointmentService.getAppointments();
        setAppointments(data);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Error al cargar turnos'));
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Appointments are already enriched from backend (no need for useMemo)
  const appointmentsWithDetails = appointments;

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointmentsWithDetails;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'ALL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(apt => {
        const aptDate = parseISO(apt.date);
        const aptDateOnly = new Date(aptDate);
        aptDateOnly.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'TODAY':
            return aptDateOnly.getTime() === today.getTime();
          case 'PAST':
            return aptDateOnly < today;
          case 'FUTURE':
            return aptDateOnly > today;
          default:
            return true;
        }
      });
    }

    // Sort by date and time (most recent first)
    return filtered.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.startTime.localeCompare(a.startTime);
    });
  }, [appointmentsWithDetails, statusFilter, dateFilter]);

  const handleUpdateStatus = async (id: number, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);

      // Reload appointments
      const data = await appointmentService.getAppointments();
      setAppointments(data);

      toast.success(`Turno ${getStatusLabel(newStatus).toLowerCase()} exitosamente`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al actualizar el turno'));
    }
  };

  const handleViewDetails = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';
      case 'NO_SHOW':
        return 'Ausente';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completado';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={16} />;
      case 'NO_SHOW':
        return <AlertCircle size={16} />;
      case 'CANCELLED':
        return <XCircle size={16} />;
      case 'COMPLETED':
        return <CheckCircle size={16} />;
    }
  };

  const canCancel = (apt: AppointmentResponse) => apt.status === 'CONFIRMED';
  const canComplete = (apt: AppointmentResponse) => apt.status === 'CONFIRMED' && isPast(parseISO(apt.date));
  const canMarkNoShow = (apt: AppointmentResponse) => apt.status === 'CONFIRMED' && isPast(parseISO(apt.date));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Turnos</h1>
          <p className="text-gray-600">Administrá y confirmá los turnos solicitados</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value="CONFIRMED">Confirmados</option>
                <option value="COMPLETED">Completados</option>
                <option value="NO_SHOW">Ausentes</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="ALL">Todas</option>
                <option value="TODAY">Hoy</option>
                <option value="FUTURE">Futuras</option>
                <option value="PAST">Pasadas</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredAppointments.length}</span> turnos
            </p>
          </div>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron turnos</p>
              <p className="text-sm mt-2">Intentá ajustar los filtros</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-grow space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-start gap-3">
                      <Calendar className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {format(parseISO(apt.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock size={14} />
                          {apt.startTime} - {apt.endTime} ({apt.serviceDuration} min)
                        </p>
                      </div>
                    </div>

                    {/* Client */}
                    <div className="flex items-start gap-3">
                      <User className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">
                          {apt.clientName}
                        </p>
                        <p className="text-sm text-gray-600">{apt.clientEmail}</p>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="flex items-start gap-3">
                      <FileText className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{apt.serviceName}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {apt.notes && (
                      <div className="ml-8 bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notas:</span> {apt.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-lg border flex items-center justify-center gap-2 ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)}
                      <span className="font-medium text-sm">{getStatusLabel(apt.status)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {canComplete(apt) && (
                        <Button
                          variant="primary"
                          onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                          className="text-sm"
                        >
                          <CheckCircle size={16} className="inline mr-1" />
                          Completar
                        </Button>
                      )}

                      {canMarkNoShow(apt) && (
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(apt.id, 'NO_SHOW')}
                          className="text-sm"
                        >
                          <AlertCircle size={16} className="inline mr-1" />
                          No Asistió
                        </Button>
                      )}

                      {canCancel(apt) && (
                        <Button
                          variant="danger"
                          onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                          className="text-sm"
                        >
                          <XCircle size={16} className="inline mr-1" />
                          Cancelar
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(apt)}
                        className="text-sm"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedAppointment && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalles del Turno">
            <div className="space-y-4">
              {/* Appointment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Información del Turno</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Fecha:</span>{' '}
                    {format(parseISO(selectedAppointment.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p>
                    <span className="font-medium">Horario:</span> {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Servicio:</span> {selectedAppointment.serviceName}
                  </p>
                  <p>
                    <span className="font-medium">Duración:</span> {selectedAppointment.serviceDuration} minutos
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Datos del Cliente</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    <span className="font-medium">Nombre:</span> {selectedAppointment.clientName}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    <span className="font-medium">Email:</span> {selectedAppointment.clientEmail}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Notas</h3>
                  <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                <p>Turno creado: {format(new Date(selectedAppointment.createdAt), "d/MM/yyyy 'a las' HH:mm", { locale: es })}</p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
