import { Appointment } from '../types';

export const APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    professionalId: 1,
    clientId: 1,
    serviceId: 1,
    date: "2025-10-15",
    startTime: "10:00",
    endTime: "10:50",
    status: "CONFIRMED",
    notes: "Primera sesión",
    createdAt: "2025-10-10T14:30:00"
  },
  {
    id: 2,
    professionalId: 1,
    clientId: 2,
    serviceId: 2,
    date: "2025-10-15",
    startTime: "15:00",
    endTime: "16:00",
    status: "PENDING",
    notes: "",
    createdAt: "2025-10-11T09:15:00"
  },
  {
    id: 3,
    professionalId: 1,
    clientId: 1,
    serviceId: 1,
    date: "2025-10-16",
    startTime: "11:00",
    endTime: "11:50",
    status: "CONFIRMED",
    notes: "Seguimiento",
    createdAt: "2025-10-10T14:35:00"
  },
  {
    id: 4,
    professionalId: 1,
    clientId: 3,
    serviceId: 4,
    date: "2025-10-16",
    startTime: "16:00",
    endTime: "16:40",
    status: "CONFIRMED",
    notes: "Primera consulta - gratis",
    createdAt: "2025-10-12T10:00:00"
  },
  {
    id: 5,
    professionalId: 1,
    clientId: 4,
    serviceId: 3,
    date: "2025-10-17",
    startTime: "09:00",
    endTime: "10:00",
    status: "PENDING",
    notes: "Consulta familiar con hijos",
    createdAt: "2025-10-12T16:20:00"
  },
  {
    id: 6,
    professionalId: 1,
    clientId: 2,
    serviceId: 1,
    date: "2025-10-18",
    startTime: "10:00",
    endTime: "10:50",
    status: "CONFIRMED",
    notes: "",
    createdAt: "2025-10-11T09:20:00"
  },
  {
    id: 7,
    professionalId: 1,
    clientId: 5,
    serviceId: 1,
    date: "2025-10-10",
    startTime: "15:00",
    endTime: "15:50",
    status: "COMPLETED",
    notes: "Sesión completada exitosamente",
    createdAt: "2025-10-05T11:00:00"
  },
  {
    id: 8,
    professionalId: 1,
    clientId: 3,
    serviceId: 1,
    date: "2025-10-09",
    startTime: "11:00",
    endTime: "11:50",
    status: "CANCELLED",
    notes: "Cancelado por el cliente",
    createdAt: "2025-10-07T14:00:00"
  },
  {
    id: 9,
    professionalId: 1,
    clientId: 1,
    serviceId: 1,
    date: "2025-10-22",
    startTime: "10:00",
    endTime: "10:50",
    status: "PENDING",
    notes: "Turno futuro",
    createdAt: "2025-10-12T18:00:00"
  },
  {
    id: 10,
    professionalId: 1,
    clientId: 2,
    serviceId: 2,
    date: "2025-10-23",
    startTime: "16:00",
    endTime: "17:00",
    status: "PENDING",
    notes: "Turno de pareja",
    createdAt: "2025-10-12T19:30:00"
  }
];
