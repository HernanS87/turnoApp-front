import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { APPOINTMENTS } from '../../data/appointments';
import { PROFESSIONAL } from '../../data/professional';
import { SERVICES } from '../../data/services';
import { Calendar, Clock, User, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export const ClientDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get client appointments
  const clientAppointments = APPOINTMENTS.filter(
    apt => apt.clientId === user?.clientId
  );

  // Get future appointments
  const futureAppointments = clientAppointments
    .filter(apt => isFuture(parseISO(apt.date)) && apt.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get past appointments
  const pastAppointments = clientAppointments
    .filter(apt => isPast(parseISO(apt.date)) || apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate professional stats
  const completedCount = clientAppointments.filter(apt => apt.status === 'COMPLETED').length;
  const lastAppointment = clientAppointments
    .filter(apt => apt.status === 'COMPLETED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'CANCELLED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Mi Dashboard</h1>
          <p className="text-gray-600">Gestiona tus turnos y profesionales</p>
        </div>

        {/* Professionals Section */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-800">
            <User className="text-primary" size={28} />
            Mis Profesionales
          </h2>

          <Card
            hover
            className="transition-all border-2 border-transparent cursor-pointer hover:border-primary"
            onClick={() => navigate(`/${PROFESSIONAL.customUrl}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-primary">
                  {PROFESSIONAL.firstName[0]}{PROFESSIONAL.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {PROFESSIONAL.firstName} {PROFESSIONAL.lastName}
                  </h3>
                  <p className="text-gray-600">{PROFESSIONAL.profession}</p>
                  {lastAppointment && (
                    <p className="mt-1 text-sm text-gray-500">
                      ⭐ Último turno: {format(parseISO(lastAppointment.date), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium text-primary">
                    📅 {completedCount} turnos completados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="hidden font-medium sm:inline">Ver perfil y agendar</span>
                <ArrowRight size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-800">
            <Calendar className="text-primary" size={28} />
            Próximos Turnos
          </h2>

          {futureAppointments.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tienes turnos programados</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/${PROFESSIONAL.customUrl}`)}
                >
                  Agendar nuevo turno
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {futureAppointments.map(apt => {
                const service = SERVICES.find(s => s.id === apt.serviceId);
                return (
                  <Card key={apt.id} className="border-l-4 border-primary">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="flex-shrink-0 text-primary" size={20} />
                          <div>
                            <p className="font-bold text-gray-800">
                              {format(parseISO(apt.date), "EEEE dd 'de' MMMM", { locale: es })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {apt.startTime} - {apt.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="ml-8">
                          <p className="font-medium text-gray-700">
                            {PROFESSIONAL.firstName} {PROFESSIONAL.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{service?.name}</p>
                          {apt.notes && (
                            <p className="mt-1 text-sm text-gray-500">Notas: {apt.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-8 md:ml-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                          <Button variant="danger" className="text-sm">
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* History */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-800">
              <Clock className="text-primary" size={28} />
              Historial
            </h2>

            <Card>
              <div className="space-y-3">
                {pastAppointments.map(apt => {
                  const service = SERVICES.find(s => s.id === apt.serviceId);
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(apt.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {format(parseISO(apt.date), 'dd/MM/yyyy')} - {PROFESSIONAL.firstName} {PROFESSIONAL.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{service?.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
