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

// Schedule DTOs
export interface ScheduleResponse {
  id: number;
  professionalId: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  active: boolean;
  createdAt: string;
}

export interface CreateScheduleRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateScheduleRequest {
  startTime?: string;
  endTime?: string;
  active?: boolean;
}

// API Error Response (matches backend ApiError.java)
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;       // HTTP error name (e.g., "Bad Request", "Unauthorized")
  message: string;     // Descriptive error message
  path: string;
  details?: string[];  // Optional validation errors
}