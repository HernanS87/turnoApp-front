import api from './api';
import {
  ServiceResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../types/api';

class ServiceService {
  async getAllServices(): Promise<ServiceResponse[]> {
    const response = await api.get<ServiceResponse[]>('/services');
    return response.data;
  }

  async getServiceById(id: number): Promise<ServiceResponse> {
    const response = await api.get<ServiceResponse>(`/services/${id}`);
    return response.data;
  }

  async createService(data: CreateServiceRequest): Promise<ServiceResponse> {
    const response = await api.post<ServiceResponse>('/services', data);
    return response.data;
  }

  async updateService(id: number, data: UpdateServiceRequest): Promise<ServiceResponse> {
    const response = await api.put<ServiceResponse>(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  }

  async toggleServiceStatus(id: number): Promise<void> {
    await api.patch(`/services/${id}/status`);
  }
}

export default new ServiceService();
