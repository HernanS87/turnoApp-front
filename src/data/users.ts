import { User } from '../types';

// Users for simulated login
export const USERS: User[] = [
  {
    id: 1,
    email: "maria@psicologia.com",
    password: "123456", // Never do this in production
    role: "professional",
    professionalId: 1
  },
  {
    id: 2,
    email: "juan@mail.com",
    password: "123456",
    role: "client",
    clientId: 1
  },
  {
    id: 3,
    email: "ana@mail.com",
    password: "123456",
    role: "client",
    clientId: 2
  },
  {
    id: 4,
    email: "pedro@mail.com",
    password: "123456",
    role: "client",
    clientId: 3
  },
  {
    id: 5,
    email: "juan@dentista.com",
    password: "123456",
    role: "professional",
    professionalId: 2
  }
];
