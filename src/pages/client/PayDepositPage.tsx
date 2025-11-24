import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AuthModal } from '../../components/auth/AuthModal';
import serviceService from '../../services/serviceService';
import appointmentService from '../../services/appointmentService';
import { getErrorMessage } from '../../utils/errorHandler';
import type { ServiceResponse } from '../../types/api';
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

export const PayDepositPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [service, setService] = useState<ServiceResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Extract params
  const customUrl = searchParams.get('customUrl');
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  useEffect(() => {
    const loadData = async () => {
      // Validate params
      if (!customUrl || !serviceId || !date || !time) {
        toast.error('Datos incompletos');
        navigate('/');
        return;
      }

      // Check authentication
      if (!user) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      // Validate role
      if (user.role !== 'CLIENT') {
        toast.error('Solo los clientes pueden agendar turnos');
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const serviceData = await serviceService.getPublicServiceByCustomUrlAndId(customUrl, parseInt(serviceId));

        // Validate service requires deposit
        if (serviceData.depositPercentage === 0) {
          toast.error('Este servicio no requiere seña');
          navigate('/');
          return;
        }

        setService(serviceData);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Error al cargar el servicio'));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, customUrl, serviceId, date, time, navigate]);

  const handlePayment = async () => {
    if (!service || !user || !date || !time) return;

    setProcessing(true);

    // Simulate payment processing (2 seconds)
    setTimeout(async () => {
      try {
        await appointmentService.createAppointment({
          serviceId: service.id,
          date,
          startTime: time,
          notes: ''
        });

        toast.success('¡Pago confirmado! Tu turno ha sido agendado exitosamente.');
        navigate('/client/dashboard');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Error al procesar el pago'));
        setProcessing(false);
      }
    }, 2000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    // Reload data after auth
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!service || !date || !time) {
    return null;
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
                {format(parseISO(date), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium text-gray-800">
                {time} - {calculateEndTime(time, service.duration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium text-gray-800">{service.duration} minutos</span>
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
                <li>• El resto del pago se abona en el consultorio</li>
                <li>• Podés cancelar tu turno desde el panel de cliente</li>
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
            <p className="text-sm text-gray-500 mb-2">Modo demo - MVP</p>
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => navigate('/')}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
