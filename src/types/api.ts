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
  province: string | null;
  city: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  province?: string;
  city?: string;
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

// Appointment DTOs
export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export interface AppointmentResponse {
  id: number;
  professionalId: number;
  professionalName: string;
  professionalCustomUrl: string;
  professionalProfession: string;
  clientId: number;
  clientName: string;
  clientEmail: string;
  serviceId: number;
  serviceName: string;
  serviceDuration: number;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  serviceId: number;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

export interface DateAvailability {
  date: string; // yyyy-MM-dd
  hasAvailability: boolean;
}

export interface AvailabilityDateResponse {
  professionalId: number;
  serviceId: number;
  availability: DateAvailability[];
}

export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
}

export interface AvailabilitySlotResponse {
  professionalId: number;
  serviceId: number;
  date: string; // yyyy-MM-dd
  serviceDuration: number;
  slots: TimeSlot[];
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