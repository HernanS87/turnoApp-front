import { Card } from '../../components/common/Card';
import { getAllAppointments } from '../../utils/appointmentStorage';
import { CLIENTS } from '../../data/clients';
import { getAllServices } from '../../utils/serviceStorage';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { format, isToday, parseISO, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export const DashboardPage = () => {
  const { user } = useAuth();
  const professionalId = user?.professionalId || 1;

  // Get appointments and services for this professional
  const allAppointments = getAllAppointments();
  const professionalAppointments = allAppointments.filter(apt => apt.professionalId === professionalId);
  const services = getAllServices(professionalId);

  // Statistics
  const todayAppointments = professionalAppointments.filter(apt => isToday(parseISO(apt.date)));
  const weekAppointments = professionalAppointments.filter(apt => isThisWeek(parseISO(apt.date), { weekStartsOn: 1 }));
  const pendingAppointments = professionalAppointments.filter(apt => apt.status === 'PENDING');
  const confirmedAppointments = professionalAppointments.filter(apt => apt.status === 'CONFIRMED');

  // Today's appointments with details
  const todayAppointmentsWithDetails = todayAppointments.map(apt => {
    const client = CLIENTS.find(c => c.id === apt.clientId);
    const service = services.find(s => s.id === apt.serviceId);
    return { ...apt, client, service };
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Resumen de tu actividad</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Turnos Hoy</p>
                <p className="text-3xl font-bold text-gray-800">{todayAppointments.length}</p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Esta Semana</p>
                <p className="text-3xl font-bold text-gray-800">{weekAppointments.length}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </Card>

          <Card className="border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-gray-800">{pendingAppointments.length}</p>
              </div>
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Confirmados</p>
                <p className="text-3xl font-bold text-gray-800">{confirmedAppointments.length}</p>
              </div>
              <CheckCircle className="text-purple-500" size={32} />
            </div>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Turnos de Hoy</h2>
          </div>

          {todayAppointmentsWithDetails.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay turnos programados para hoy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointmentsWithDetails.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-start gap-3 mb-2">
                        <Clock className="text-primary mt-1 flex-shrink-0" size={20} />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {apt.startTime} - {apt.endTime}
                          </p>
                          <p className="text-sm text-gray-600">
                            {apt.client?.firstName} {apt.client?.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="ml-8">
                        <p className="text-sm font-medium text-gray-700">{apt.service?.name}</p>
                        {apt.notes && (
                          <p className="text-sm text-gray-500 mt-1">Notas: {apt.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-8 md:ml-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
