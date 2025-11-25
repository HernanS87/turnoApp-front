// Type definitions for TurnoApp

export type UserRole = 'professional' | 'client';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type Status = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  email: string;
  password: string; // Only for demo, never in production
  role: UserRole;
  professionalId?: number;
  clientId?: number;
}

export interface Professional {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  profession: string;
  email: string;
  phone: string;
  customUrl: string;
  status: Status;
  registrationDate?: string;
  siteConfig?: SiteConfig;
}

export interface SiteConfig {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  professionalDescription: string;
  address: string;
  city: string;
  province: string;
  country: string;
  businessHours: string;
  welcomeMessage: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  requiresDeposit: boolean;
  depositPercentage: number;
  status: Status;
  category: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  registrationDate: string;
  status: Status;
}

export interface Appointment {
  id: number;
  professionalId: number;
  clientId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export interface ScheduleSlot {
  id: number;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string;
  endTime: string;
  active: boolean;
}
