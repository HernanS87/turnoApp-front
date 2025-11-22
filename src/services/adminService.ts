import api from './api';
import {
  ProfessionalResponse,
  CreateProfessionalRequest,
  UpdateProfessionalRequest,
} from '../types/api';

class AdminService {
  async getAllProfessionals(): Promise<ProfessionalResponse[]> {
    const response = await api.get<ProfessionalResponse[]>('/admin/professionals');
    return response.data;
  }

  async getProfessionalById(id: number): Promise<ProfessionalResponse> {
    const response = await api.get<ProfessionalResponse>(`/admin/professionals/${id}`);
    return response.data;
  }

  async createProfessional(data: CreateProfessionalRequest): Promise<ProfessionalResponse> {
    const response = await api.post<ProfessionalResponse>('/admin/professionals', data);
    return response.data;
  }

  async updateProfessional(id: number, data: UpdateProfessionalRequest): Promise<ProfessionalResponse> {
    const response = await api.put<ProfessionalResponse>(`/admin/professionals/${id}`, data);
    return response.data;
  }

  async toggleProfessionalStatus(id: number): Promise<void> {
    await api.patch(`/admin/professionals/${id}/status`);
  }
}

export default new AdminService();