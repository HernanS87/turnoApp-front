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
};

