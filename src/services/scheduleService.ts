import api from './api';
import {
  ScheduleResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../types/api';

class ScheduleService {
  async getSchedule(): Promise<ScheduleResponse[]> {
    const response = await api.get<ScheduleResponse[]>('/schedule');
    return response.data;
  }

  async getScheduleById(id: number): Promise<ScheduleResponse> {
    const response = await api.get<ScheduleResponse>(`/schedule/${id}`);
    return response.data;
  }

  async createSchedule(data: CreateScheduleRequest): Promise<ScheduleResponse> {
    const response = await api.post<ScheduleResponse>('/schedule', data);
    return response.data;
  }

  async updateSchedule(id: number, data: UpdateScheduleRequest): Promise<ScheduleResponse> {
    const response = await api.put<ScheduleResponse>(`/schedule/${id}`, data);
    return response.data;
  }

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/schedule/${id}`);
  }
}

export default new ScheduleService();
