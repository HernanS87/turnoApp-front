import { Professional } from '../types';

export const PROFESSIONALS: Professional[] = [
  {
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
  },
  {
    id: 2,
    firstName: "Juan",
    lastName: "Pérez",
    profession: "Odontólogo",
    email: "juan@dentista.com",
    phone: "+54 261 987-6543",
    customUrl: "juan-perez-dentista",
    status: "ACTIVE",
    registrationDate: "2025-10-15",
    siteConfig: {
      logoUrl: "/assets/logo-default.png",
      primaryColor: "#6366f1", // Indigo (default)
      secondaryColor: "#8b5cf6", // Purple (default)
      professionalDescription: "Odontólogo recién registrado. Configurá tu perfil para empezar a recibir pacientes.",
      address: "Dirección no configurada",
      city: "Mendoza",
      province: "Mendoza",
      country: "Argentina",
      businessHours: "No configurado",
      welcomeMessage: "Bienvenido a mi consultorio",
      socialMedia: {
        instagram: "",
        facebook: "",
        linkedin: ""
      }
    }
  }
];

// Helper function to get professional by ID
export const getProfessionalById = (id: number): Professional | undefined => {
  return PROFESSIONALS.find(p => p.id === id);
};

// Helper function to get professional by custom URL
export const getProfessionalByUrl = (customUrl: string): Professional | undefined => {
  return PROFESSIONALS.find(p => p.customUrl === customUrl);
};

// Export first professional for backward compatibility (María)
export const PROFESSIONAL = PROFESSIONALS[0];
