import api from './api';
import type {
  AppointmentResponse,
  CreateAppointmentRequest,
  AvailabilityDateResponse,
  AvailabilitySlotResponse,
  AppointmentStatus,
} from '../types/api';

/**
 * Servicio para gestión de turnos (Appointments).
 *
 * Endpoints:
 * - GET /api/appointments - Lista turnos del profesional
 * - GET /api/appointments/client - Lista turnos del cliente
 * - POST /api/appointments - Crear turno
 * - PATCH /api/appointments/:id/status - Cambiar estado
 * - GET /api/appointments/availability/dates - Disponibilidad por fechas
 * - GET /api/appointments/availability/slots - Slots disponibles
 *
 * Patrón: Service Layer (frontend)
 * Principio: Single Responsibility - Solo maneja comunicación HTTP con API
 */
class AppointmentService {
  /**
   * Obtiene todos los turnos del profesional autenticado.
   * Requiere rol: PROFESSIONAL
   */
  async getAppointments(): Promise<AppointmentResponse[]> {
    const response = await api.get<AppointmentResponse[]>('/appointments');
    return response.data;
  }

  /**
   * Obtiene todos los turnos del cliente autenticado.
   * Requiere rol: CLIENT
   */
  async getClientAppointments(): Promise<AppointmentResponse[]> {
    const response = await api.get<AppointmentResponse[]>('/appointments/client');
    return response.data;
  }

  /**
   * Crea un nuevo turno (cliente agenda).
   * Requiere rol: CLIENT
   *
   * @param data Datos del turno (serviceId, date, startTime, notes)
   * @returns Turno creado con estado CONFIRMED
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
    const response = await api.post<AppointmentResponse>('/appointments', data);
    return response.data;
  }

  /**
   * Actualiza el estado de un turno.
   * Requiere rol: PROFESSIONAL o CLIENT (según el nuevo estado)
   *
   * Permisos:
   * - COMPLETED / NO_SHOW: Solo profesional
   * - CANCELLED: Profesional o cliente
   *
   * @param id ID del turno
   * @param status Nuevo estado
   * @returns Turno actualizado
   */
  async updateAppointmentStatus(
    id: number,
    status: AppointmentStatus
  ): Promise<AppointmentResponse> {
    const response = await api.patch<AppointmentResponse>(
      `/appointments/${id}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Obtiene disponibilidad por rango de fechas (para calendario).
   * Endpoint público (no requiere autenticación).
   *
   * Uso: Marcar días disponibles en el calendario
   *
   * @param professionalId ID del profesional
   * @param serviceId ID del servicio
   * @param startDate Fecha inicial (yyyy-MM-dd)
   * @param endDate Fecha final (yyyy-MM-dd)
   * @returns Lista de fechas con boolean de disponibilidad
   */
  async getAvailabilityByDates(
    professionalId: number,
    serviceId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityDateResponse> {
    const response = await api.get<AvailabilityDateResponse>(
      '/appointments/availability/dates',
      {
        params: {
          professionalId,
          serviceId,
          startDate,
          endDate,
        },
      }
    );
    return response.data;
  }

  /**
   * Obtiene slots disponibles para una fecha específica.
   * Endpoint público (no requiere autenticación).
   *
   * Uso: Mostrar selector de horarios en la página de reserva
   *
   * @param professionalId ID del profesional
   * @param serviceId ID del servicio
   * @param date Fecha a consultar (yyyy-MM-dd)
   * @returns Lista de slots con disponibilidad
   */
  async getAvailableSlots(
    professionalId: number,
    serviceId: number,
    date: string
  ): Promise<AvailabilitySlotResponse> {
    const response = await api.get<AvailabilitySlotResponse>(
      '/appointments/availability/slots',
      {
        params: {
          professionalId,
          serviceId,
          date,
        },
      }
    );
    return response.data;
  }
}

// Singleton
export default new AppointmentService();
