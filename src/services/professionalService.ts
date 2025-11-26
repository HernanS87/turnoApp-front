import api from './api';
import { Professional, SiteConfig } from '../types';

export interface SiteConfigRequest {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  professionalDescription?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  businessHours?: string;
  welcomeMessage?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export const professionalService = {
  // Obtener perfil del profesional autenticado
  async getMyProfile(): Promise<Professional> {
    const response = await api.get<Professional>('/professionals/me');
    return response.data;
  },

  // Actualizar configuración del sitio
  async updateSiteConfig(config: SiteConfigRequest): Promise<Professional> {
    const response = await api.put<Professional>('/professionals/me/site-config', config);
    return response.data;
  },

  // Obtener profesional por custom URL (público)
  async getProfessionalByCustomUrl(customUrl: string): Promise<Professional> {
    const response = await api.get<Professional>(`/professionals/public/by-url/${customUrl}`);
    return response.data;
  },

  // Buscar profesionales con filtros (público)
  async searchProfessionals(params: {
    profession?: string;
    province?: string;
    city?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<{
    content: Professional[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params.profession) queryParams.append('profession', params.profession);
    if (params.province) queryParams.append('province', params.province);
    if (params.city) queryParams.append('city', params.city);
    if (params.search) queryParams.append('search', params.search);
    queryParams.append('page', String(params.page || 0));
    queryParams.append('size', String(params.size || 12));

    const response = await api.get<{
      content: Professional[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`/professionals/public/search?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener opciones de filtros (público)
  async getFilterOptions(): Promise<{
    professions: string[];
    provinces: string[];
    cities: string[];
  }> {
    const response = await api.get<{
      professions: string[];
      provinces: string[];
      cities: string[];
    }>('/professionals/public/filter-options');
    return response.data;
  },
};

