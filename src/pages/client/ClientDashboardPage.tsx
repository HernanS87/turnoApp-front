import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import appointmentService from '../../services/appointmentService';
import { getErrorMessage } from '../../utils/errorHandler';
import type { AppointmentResponse } from '../../types/api';
import { Calendar, Clock, User, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

export const ClientDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Load client appointments from API
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getClientAppointments();
      setAppointments(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al cargar turnos'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      return;
    }

    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CANCELLED');
      toast.success('Turno cancelado exitosamente');
      // Reload appointments to reflect the change
      await loadAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al cancelar el turno'));
    }
  };

  // Get future appointments
  const futureAppointments = appointments
    .filter(apt => isFuture(parseISO(apt.date)) && apt.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get past appointments
  const pastAppointments = appointments
    .filter(apt => isPast(parseISO(apt.date)) || apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate stats
  const completedCount = appointments.filter(apt => apt.status === 'COMPLETED').length;

  // Get unique professionals with aggregated information
  interface ProfessionalInfo {
    id: number;
    name: string;
    customUrl: string;
    profession: string;
    lastAppointmentDate: Date;
    totalAppointments: number;
    completedAppointments: number;
  }

  const professionalsMap = new Map<number, ProfessionalInfo>();

  appointments.forEach((apt) => {
    const existing = professionalsMap.get(apt.professionalId);
    const aptDate = parseISO(apt.date);

    if (!existing) {
      // Nuevo profesional
      professionalsMap.set(apt.professionalId, {
        id: apt.professionalId,
        name: apt.professionalName,
        customUrl: apt.professionalCustomUrl,
        profession: apt.professionalProfession,
        lastAppointmentDate: aptDate,
        totalAppointments: 1,
        completedAppointments: apt.status === 'COMPLETED' ? 1 : 0,
      });
    } else {
      // Actualizar información existente
      if (aptDate > existing.lastAppointmentDate) {
        existing.lastAppointmentDate = aptDate;
      }
      existing.totalAppointments++;
      if (apt.status === 'COMPLETED') {
        existing.completedAppointments++;
      }
    }
  });

  // Ordenar por fecha del último turno (más reciente primero) y limitar a 2
  const allProfessionals = Array.from(professionalsMap.values())
    .sort((a, b) => b.lastAppointmentDate.getTime() - a.lastAppointmentDate.getTime());

  const recentProfessionals = allProfessionals.slice(0, 2);
  const hasMoreProfessionals = allProfessionals.length > 2;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completado';
      case 'NO_SHOW':
        return 'No asistió';
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
      case 'NO_SHOW':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-gray-600">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Mi Dashboard</h1>
          <p className="text-gray-600">Gestiona tus turnos y profesionales</p>
        </div>

        {/* Professionals Section */}
        {recentProfessionals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <User className="text-primary" size={28} />
                Mis Profesionales
              </h2>
              {hasMoreProfessionals && (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/find-professionals')}
                  className="text-sm"
                >
                  Ver todos ({allProfessionals.length})
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {recentProfessionals.map(prof => (
                <Card
                  key={prof.id}
                  hover
                  className="transition-all border-2 border-transparent cursor-pointer hover:border-primary"
                  onClick={() => navigate(`/${prof.customUrl}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-primary">
                        {prof.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{prof.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{prof.profession}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          ⭐ Último turno: {format(prof.lastAppointmentDate, 'dd/MM/yyyy', { locale: es })}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm font-medium text-primary">
                            📅 {prof.totalAppointments} turno{prof.totalAppointments !== 1 ? 's' : ''} total{prof.totalAppointments !== 1 ? 'es' : ''}
                          </p>
                          {prof.completedAppointments > 0 && (
                            <p className="text-sm text-gray-600">
                              ✓ {prof.completedAppointments} completado{prof.completedAppointments !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="hidden font-medium sm:inline">Ver perfil y agendar</span>
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                  onClick={() => navigate('/find-professionals')}
                >
                  Agendar nuevo turno
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {futureAppointments.map(apt => (
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
                        <p className="font-medium text-gray-700">{apt.professionalName}</p>
                        <p className="text-sm text-gray-600">{apt.serviceName}</p>
                        {apt.notes && (
                          <p className="mt-1 text-sm text-gray-500">Notas: {apt.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-8 md:ml-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                      {apt.status === 'CONFIRMED' && (
                        <Button 
                          variant="danger" 
                          className="text-sm"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
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
                {pastAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(apt.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {format(parseISO(apt.date), 'dd/MM/yyyy')} - {apt.professionalName}
                        </p>
                        <p className="text-xs text-gray-500">{apt.serviceName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
