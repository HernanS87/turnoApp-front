import api from './api';
import type {
  AppointmentResponse,
  CreateAppointmentRequest,
  AvailabilityDateResponse,
  AvailabilitySlotResponse,
  AppointmentStatus,
} from '../types/api';

class AppointmentService {

  async getAppointments(): Promise<AppointmentResponse[]> {
    const response = await api.get<AppointmentResponse[]>('/appointments');
    return response.data;
  }


  async getClientAppointments(): Promise<AppointmentResponse[]> {
    const response = await api.get<AppointmentResponse[]>('/appointments/client');
    return response.data;
  }


  async createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
    const response = await api.post<AppointmentResponse>('/appointments', data);
    return response.data;
  }


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

export default new AppointmentService();
