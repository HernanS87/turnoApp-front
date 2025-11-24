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
import { ArrowLeft, Clock, DollarSign } from 'lucide-react';
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
          <Card className="bg-primary bg-opacity-5 border-2 border-primary">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Servicio:</span>
                <span className="font-medium text-gray-800">{service.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium text-gray-800">
                  {format(selectedDate, "EEEE dd 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Horario:</span>
                <span className="font-medium text-gray-800">
                  {selectedTime} - {calculateEndTime(selectedTime, service.duration)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium text-gray-800">{service.duration} minutos</span>
              </div>
            </div>

            <Button
              fullWidth
              onClick={handleConfirm}
              className="text-lg py-3"
            >
              Confirmar turno
            </Button>
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
