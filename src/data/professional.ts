import { Professional } from '../types';

export const PROFESSIONAL: Professional = {
  id: 1,
  firstName: "María",
  lastName: "Rodríguez",
  profession: "Psicóloga",
  email: "maria@psicologia.com",
  phone: "+54 261 123-4567",
  customUrl: "maria-rodriguez",
  status: "ACTIVE",
  registrationDate: "2025-01-10",
  siteConfig: {
    logoUrl: "/assets/logo-default.png",
    primaryColor: "#6366f1", // Indigo
    secondaryColor: "#8b5cf6", // Purple
    professionalDescription: "Psicóloga especializada en terapia cognitivo-conductual con 10 años de experiencia. Atención personalizada y enfoque empático para ayudarte a superar tus desafíos emocionales.",
    address: "San Martín 1234, Piso 3, Oficina 5",
    city: "Mendoza",
    province: "Mendoza",
    country: "Argentina",
    businessHours: "Lunes a Viernes 9:00 - 18:00",
    welcomeMessage: "Bienvenido a mi consultorio virtual",
    socialMedia: {
      instagram: "@maria.psicologa",
      facebook: "mariarodriguezpsicologa",
      linkedin: "maria-rodriguez-psi"
    }
  }
};
