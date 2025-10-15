import { Appointment } from '../types';
import { APPOINTMENTS } from '../data/appointments';

const STORAGE_KEY = 'appointments';

/**
 * Get all appointments (hardcoded + stored in localStorage)
 */
export const getAllAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const storedAppointments = stored ? JSON.parse(stored) : [];
  return [...APPOINTMENTS, ...storedAppointments];
};

/**
 * Get appointments for a specific client
 */
export const getClientAppointments = (clientId: number): Appointment[] => {
  return getAllAppointments().filter(apt => apt.clientId === clientId);
};

/**
 * Create a new appointment
 */
export const createAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
  const allAppointments = getAllAppointments();

  // Generate new ID
  const maxId = allAppointments.reduce((max, apt) => Math.max(max, apt.id), 0);

  const newAppointment: Appointment = {
    ...appointmentData,
    id: maxId + 1,
    createdAt: new Date().toISOString()
  };

  // Get only stored appointments (don't re-save hardcoded ones)
  const stored = localStorage.getItem(STORAGE_KEY);
  const storedAppointments = stored ? JSON.parse(stored) : [];

  // Add new appointment
  storedAppointments.push(newAppointment);

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAppointments));

  return newAppointment;
};

/**
 * Update an appointment
 */
export const updateAppointment = (id: number, updates: Partial<Appointment>): Appointment | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const storedAppointments: Appointment[] = stored ? JSON.parse(stored) : [];

  const index = storedAppointments.findIndex(apt => apt.id === id);

  if (index !== -1) {
    storedAppointments[index] = { ...storedAppointments[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAppointments));
    return storedAppointments[index];
  }

  return null;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = (id: number): boolean => {
  const updated = updateAppointment(id, { status: 'CANCELLED' });
  return updated !== null;
};
