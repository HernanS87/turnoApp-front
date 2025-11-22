import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DateSelector } from '../../components/client/DateSelector';
import { TimeSlotSelector } from '../../components/client/TimeSlotSelector';
import { AuthModal } from '../../components/auth/AuthModal';
import { SERVICES } from '../../data/services';
import { PROFESSIONAL } from '../../data/professional';
import { getAvailableDates, getAvailableSlots, calculateEndTime } from '../../utils/availabilityUtils';
import { createAppointment } from '../../utils/appointmentStorage';
import { ArrowLeft, Clock, DollarSign, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

export const BookAppointmentPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(SERVICES.find(s => s.id === parseInt(serviceId || '0')));
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load available dates on mount
  useEffect(() => {
    if (!service) {
      navigate('/');
      return;
    }

    setLoading(true);
    const dates = getAvailableDates(service, 14);
    setAvailableDates(dates);
    setLoading(false);
  }, [service, navigate]);

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate && service) {
      const slots = getAvailableSlots(selectedDate, service);
      setAvailableSlots(slots);
      setSelectedTime(null); // Reset time selection
    }
  }, [selectedDate, service]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    // Save pending appointment to sessionStorage
    sessionStorage.setItem('pendingAppointment', JSON.stringify({
      serviceId: service?.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime
    }));

    // If not authenticated, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If authenticated, proceed to next step
    proceedToNextStep();
  };

  const proceedToNextStep = () => {
    if (service?.requiresDeposit) {
      // Requires deposit → Go to payment page
      navigate('/pay-deposit');
    } else {
      // No deposit required → Create appointment immediately and go to dashboard
      if (!user?.clientId || !selectedDate || !selectedTime || !service) {
        toast.error('Error al crear el turno');
        return;
      }

      const endTime = calculateEndTime(selectedTime, service.durationMinutes);
      createAppointment({
        professionalId: PROFESSIONAL.id,
        clientId: user.clientId,
        serviceId: service.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime,
        status: 'CONFIRMED',
        notes: ''
      });

      // Clear pending appointment from sessionStorage
      sessionStorage.removeItem('pendingAppointment');

      toast.success('¡Turno agendado exitosamente!');
      navigate('/client/dashboard');
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
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {PROFESSIONAL.firstName[0]}{PROFESSIONAL.lastName[0]}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {PROFESSIONAL.firstName} {PROFESSIONAL.lastName}
          </h1>
          <p className="text-gray-600">{PROFESSIONAL.profession}</p>
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

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} className="text-primary" />
              <span>{service.durationMinutes} minutos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign size={18} className="text-primary" />
              <span className="font-bold">
                {service.price === 0 ? 'Gratis' : `$${service.price.toLocaleString()}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} className="text-primary" />
              <span>{PROFESSIONAL.siteConfig.city}</span>
            </div>
          </div>

          {service.requiresDeposit && (
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
            availableDates={availableDates}
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
                  {selectedTime} - {calculateEndTime(selectedTime, service.durationMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium text-gray-800">{service.durationMinutes} minutos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Dirección:</span>
                <span className="font-medium text-gray-800">{PROFESSIONAL.siteConfig.address}</span>
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
