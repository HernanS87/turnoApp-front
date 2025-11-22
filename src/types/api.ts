// Types aligned with backend DTOs

export type UserRole = 'ADMIN' | 'PROFESSIONAL' | 'CLIENT';
export type Status = 'ACTIVE' | 'INACTIVE';

// Auth DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  professionalId: number | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
}

// Professional DTOs
export interface ProfessionalResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  customUrl: string;
  phone: string;
  status: Status;
}

export interface CreateProfessionalRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  profession: string;
  customUrl: string;
}

export interface UpdateProfessionalRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profession?: string;
  customUrl?: string;
}

// Service DTOs
export interface ServiceResponse {
  id: number;
  professionalId: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  depositPercentage: number;
  status: Status;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  price: number;
  duration: number;
  depositPercentage: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  depositPercentage?: number;
}

// API Error Response
export interface ApiError {
  error: string;
  timestamp: string;
}