import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DateSelector } from '../../components/client/DateSelector';
import { TimeSlotSelector } from '../../components/client/TimeSlotSelector';
import { AuthModal } from '../../components/auth/AuthModal';
import serviceService from '../../services/serviceService';
import appointmentService from '../../services/appointmentService';
import { getErrorMessage } from '../../utils/errorHandler';
import type { ServiceResponse, DateAvailability } from '../../types/api';
import { ArrowLeft, Clock, DollarSign, Calendar, CheckCircle2, Timer } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Helper function to calculate end time
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

export const BookAppointmentPage = () => {
  const { customUrl, serviceId } = useParams<{ customUrl: string; serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState<ServiceResponse | null>(null);
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load service and availability from API
  useEffect(() => {
    const loadServiceAndAvailability = async () => {
      if (!customUrl || !serviceId) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        // Load service using public endpoint
        const serviceData = await serviceService.getPublicServiceByCustomUrlAndId(customUrl, parseInt(serviceId));
        setService(serviceData);

        // Load availability
        const today = new Date();
        const endDate = addDays(today, 30);

        const response = await appointmentService.getAvailabilityByDates(
          serviceData.professionalId,
          serviceData.id,
          format(today, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );

        setAvailability(response.availability);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Error al cargar información'));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadServiceAndAvailability();
  }, [customUrl, serviceId, navigate]);

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate && service) {
      const loadSlots = async () => {
        try {
          const response = await appointmentService.getAvailableSlots(
            service.professionalId,
            service.id,
            format(selectedDate, 'yyyy-MM-dd')
          );

          const available = response.slots
            .filter(slot => slot.available)
            .map(slot => slot.startTime);

          setAvailableSlots(available);
          setSelectedTime(null);
        } catch (error) {
          toast.error(getErrorMessage(error, 'Error al cargar horarios'));
          setAvailableSlots([]);
        }
      };

      loadSlots();
    }
  }, [selectedDate, service]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    // If not authenticated, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If authenticated, proceed to next step
    proceedToNextStep();
  };

  const proceedToNextStep = async () => {
    if (!selectedDate || !selectedTime || !service || !customUrl) {
      toast.error('Error al crear el turno');
      return;
    }

    if (service.depositPercentage > 0) {
      // Requires deposit → Go to payment page with query params
      const params = new URLSearchParams({
        customUrl,
        serviceId: service.id.toString(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      });
      navigate(`/pay-deposit?${params.toString()}`);
    } else {
      // No deposit required → Create appointment immediately via API
      try {
        await appointmentService.createAppointment({
          serviceId: service.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          notes: ''
        });

        toast.success('¡Turno agendado exitosamente!');
        navigate('/client/dashboard');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Error al agendar el turno'));
      }
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    proceedToNextStep();
  };

  if (!service) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Professional Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Agendar Turno</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Seleccioná tu turno
        </h2>

        {/* Service Info */}
        <Card className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} className="text-primary" />
              <span>{service.duration} minutos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign size={18} className="text-primary" />
              <span className="font-bold">
                {service.price === 0 ? 'Gratis' : `$${service.price.toLocaleString()}`}
              </span>
            </div>
          </div>

          {service.depositPercentage > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Requiere seña del {service.depositPercentage}%
                ({service.price > 0 ? `$${(service.price * (service.depositPercentage / 100)).toLocaleString()}` : 'Gratis'})
              </p>
            </div>
          )}
        </Card>

        {/* Date Selection */}
        <Card className="mb-6">
          <DateSelector
            availability={availability}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </Card>

        {/* Time Selection */}
        {selectedDate && (
          <Card className="mb-6">
            <TimeSlotSelector
              availableSlots={availableSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          </Card>
        )}

        {/* Summary & Confirm */}
        {selectedDate && selectedTime && (
          <Card className="relative overflow-hidden">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-primary/20">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Resumen del Turno</h3>
                  <p className="text-sm text-gray-500">Revisá los detalles antes de confirmar</p>
                </div>
              </div>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                {/* Service */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="p-2 rounded-lg bg-blue-100 mt-0.5">
                    <CheckCircle2 className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Servicio</p>
                    <p className="text-base font-semibold text-gray-800">{service.name}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                  <div className="p-2 rounded-lg bg-purple-100 mt-0.5">
                    <Calendar className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Fecha</p>
                    <p className="text-base font-semibold text-gray-800">
                      {format(selectedDate, "EEEE dd 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                  <div className="p-2 rounded-lg bg-green-100 mt-0.5">
                    <Clock className="text-green-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Horario</p>
                    <p className="text-base font-semibold text-gray-800">
                      {selectedTime} - {calculateEndTime(selectedTime, service.duration)}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <div className="p-2 rounded-lg bg-amber-100 mt-0.5">
                    <Timer className="text-amber-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Duración</p>
                    <p className="text-base font-semibold text-gray-800">{service.duration} minutos</p>
                  </div>
                </div>
              </div>

              {/* Price info if applicable */}
              {service.price > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-gray-600" size={18} />
                      <span className="text-sm text-gray-600">Precio total:</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800">
                      ${service.price.toLocaleString()}
                    </span>
                  </div>
                  {service.depositPercentage > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seña ({service.depositPercentage}%):</span>
                      <span className="text-lg font-semibold text-primary">
                        ${(service.price * (service.depositPercentage / 100)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Button */}
              <Button
                fullWidth
                onClick={handleConfirm}
                className="text-lg py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Confirmar turno
              </Button>
            </div>
          </Card>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};
