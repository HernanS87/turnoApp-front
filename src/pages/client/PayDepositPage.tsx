import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SERVICES } from '../../data/services';
import { PROFESSIONAL } from '../../data/professional';
import { createAppointment } from '../../utils/appointmentStorage';
import { calculateEndTime } from '../../utils/availabilityUtils';
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface PendingAppointment {
  serviceId: number;
  date: string;
  time: string;
}

export const PayDepositPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingAppointment, setPendingAppointment] = useState<PendingAppointment | null>(null);
  const [service, setService] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Load pending appointment
    const pending = sessionStorage.getItem('pendingAppointment');
    if (!pending) {
      navigate('/');
      return;
    }

    try {
      const data = JSON.parse(pending);
      setPendingAppointment(data);

      const svc = SERVICES.find(s => s.id === data.serviceId);
      if (!svc || !svc.requiresDeposit) {
        // Service doesn't require deposit, shouldn't be here
        navigate('/');
        return;
      }

      setService(svc);
    } catch (error) {
      console.error('Error parsing pending appointment:', error);
      navigate('/');
    }
  }, [user, navigate]);

  const handlePayment = () => {
    if (!pendingAppointment || !service || !user) return;

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      try {
        // Create appointment with PENDING status
        const newAppointment = createAppointment({
          professionalId: PROFESSIONAL.id,
          clientId: user.clientId!,
          serviceId: service.id,
          date: pendingAppointment.date,
          startTime: pendingAppointment.time,
          endTime: calculateEndTime(pendingAppointment.time, service.durationMinutes),
          status: 'PENDING',
          notes: ''
        });

        // Clear pending appointment
        sessionStorage.removeItem('pendingAppointment');

        // Show success message
        toast.success('¡Pago confirmado! Tu turno está pendiente de aprobación por el profesional.');

        // Redirect to dashboard
        navigate('/client/dashboard');
      } catch (error) {
        console.error('Error creating appointment:', error);
        toast.error('Error al procesar el pago. Por favor intentá nuevamente.');
        setProcessing(false);
      }
    }, 2000); // Simulate 2s payment processing
  };

  const handleCancel = () => {
    sessionStorage.removeItem('pendingAppointment');
    navigate(-1);
  };

  if (!pendingAppointment || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const depositAmount = service.price * (service.depositPercentage / 100);
  const remainingAmount = service.price - depositAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={processing}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            <CreditCard size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pago de Seña</h1>
          <p className="text-gray-600">Confirmá tu turno abonando la seña requerida</p>
        </div>

        {/* Appointment Summary */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del Turno</h2>

          <div className="space-y-3 pb-4 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-800">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-800">
                {format(parseISO(pendingAppointment.date), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium text-gray-800">
                {pendingAppointment.time} - {calculateEndTime(pendingAppointment.time, service.durationMinutes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium text-gray-800">{service.durationMinutes} minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profesional:</span>
              <span className="font-medium text-gray-800">
                {PROFESSIONAL.firstName} {PROFESSIONAL.lastName}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Precio total:</span>
              <span className="font-bold text-gray-800">${service.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Seña ({service.depositPercentage}%):</span>
              <span className="font-bold text-primary">${depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Resto a abonar en consultorio:</span>
              <span className="text-sm text-gray-600">${remainingAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="mb-6 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Información importante</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• El pago de la seña confirma tu turno</li>
                <li>• El profesional revisará y confirmará tu solicitud</li>
                <li>• El resto del pago se abona en el consultorio</li>
                <li>• Recibirás una notificación cuando tu turno sea confirmado</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Cancellation Policy */}
        <Card className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">📋 Política de cancelación</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>+48 horas antes:</strong> Reembolso del 100%</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <span><strong>24-48 horas antes:</strong> Reembolso del 50%</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span><strong>Menos de 24 horas:</strong> Sin reembolso</span>
            </li>
          </ul>
        </Card>

        {/* Payment Button */}
        <Card className="bg-white">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-2">Modo demo - v0.1</p>
            <p className="text-xs text-gray-400">
              En producción se integrará con MercadoPago
            </p>
          </div>

          <Button
            fullWidth
            onClick={handlePayment}
            disabled={processing}
            className="text-lg py-4 mb-3"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando pago...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard size={20} />
                Pagar ${depositAmount.toLocaleString()} (Simulado)
              </span>
            )}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={handleCancel}
            disabled={processing}
          >
            Cancelar
          </Button>
        </Card>
      </div>
    </div>
  );
};
