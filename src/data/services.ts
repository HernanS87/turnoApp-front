import { Service } from '../types';

export const SERVICES: Service[] = [
  {
    id: 1,
    name: "Consulta Individual",
    description: "Sesión de terapia individual de 50 minutos. Espacio confidencial para abordar ansiedad, estrés, depresión y otros desafíos emocionales.",
    price: 8000,
    durationMinutes: 50,
    requiresDeposit: true,
    depositPercentage: 50,
    status: "ACTIVE",
    category: "Terapia Individual"
  },
  {
    id: 2,
    name: "Consulta de Pareja",
    description: "Sesión de terapia de pareja de 60 minutos. Trabajo conjunto para mejorar la comunicación y resolver conflictos.",
    price: 12000,
    durationMinutes: 60,
    requiresDeposit: false,
    depositPercentage: 0,
    status: "ACTIVE",
    category: "Terapia de Pareja"
  },
  {
    id: 3,
    name: "Consulta Familiar",
    description: "Sesión de terapia familiar de 60 minutos. Orientada a mejorar la dinámica familiar y resolver conflictos intergeneracionales.",
    price: 15000,
    durationMinutes: 60,
    requiresDeposit: true,
    depositPercentage: 30,
    status: "ACTIVE",
    category: "Terapia Familiar"
  },
  {
    id: 4,
    name: "Primera Consulta",
    description: "Primera sesión de evaluación de 40 minutos sin cargo. Conocenos y definí si querés continuar con el tratamiento.",
    price: 0,
    durationMinutes: 40,
    requiresDeposit: false,
    depositPercentage: 0,
    status: "ACTIVE",
    category: "Evaluación"
  }
];
