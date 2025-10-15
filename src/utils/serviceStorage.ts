import { Service } from '../types';
import { SERVICES } from '../data/services';

const getStorageKey = (professionalId: number) => `services_${professionalId}`;

/**
 * Get all services (hardcoded + stored in localStorage)
 */
export const getAllServices = (professionalId: number = 1): Service[] => {
  const stored = localStorage.getItem(getStorageKey(professionalId));
  const storedServices = stored ? JSON.parse(stored) : [];

  // If there are stored services, use them; otherwise use hardcoded (only for María)
  if (storedServices.length > 0) {
    return storedServices;
  }

  // Only María (professionalId=1) has hardcoded services, others start empty
  return professionalId === 1 ? SERVICES : [];
};

/**
 * Get active services only
 */
export const getActiveServices = (professionalId: number = 1): Service[] => {
  return getAllServices(professionalId).filter(service => service.status === 'ACTIVE');
};

/**
 * Get service by ID
 */
export const getServiceById = (id: number, professionalId: number = 1): Service | undefined => {
  return getAllServices(professionalId).find(service => service.id === id);
};

/**
 * Create a new service
 */
export const createService = (serviceData: Omit<Service, 'id'>, professionalId: number = 1): Service => {
  const allServices = getAllServices(professionalId);

  // Generate new ID
  const maxId = allServices.reduce((max, service) => Math.max(max, service.id), 0);

  const newService: Service = {
    ...serviceData,
    id: maxId + 1
  };

  const updatedServices = [...allServices, newService];

  // Save to localStorage
  localStorage.setItem(getStorageKey(professionalId), JSON.stringify(updatedServices));

  return newService;
};

/**
 * Update a service
 */
export const updateService = (id: number, updates: Partial<Service>, professionalId: number = 1): Service | null => {
  const allServices = getAllServices(professionalId);
  const index = allServices.findIndex(service => service.id === id);

  if (index !== -1) {
    allServices[index] = { ...allServices[index], ...updates };
    localStorage.setItem(getStorageKey(professionalId), JSON.stringify(allServices));
    return allServices[index];
  }

  return null;
};

/**
 * Delete a service (soft delete by setting status to INACTIVE)
 */
export const deleteService = (id: number, professionalId: number = 1): boolean => {
  const updated = updateService(id, { status: 'INACTIVE' }, professionalId);
  return updated !== null;
};

/**
 * Permanently delete a service (hard delete)
 */
export const permanentlyDeleteService = (id: number, professionalId: number = 1): boolean => {
  const allServices = getAllServices(professionalId);
  const filteredServices = allServices.filter(service => service.id !== id);

  if (filteredServices.length < allServices.length) {
    localStorage.setItem(getStorageKey(professionalId), JSON.stringify(filteredServices));
    return true;
  }

  return false;
};

/**
 * Toggle service active status
 */
export const toggleServiceActive = (id: number, professionalId: number = 1): boolean => {
  const service = getServiceById(id, professionalId);
  if (service) {
    const newStatus = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = updateService(id, { status: newStatus }, professionalId);
    return updated !== null;
  }
  return false;
};

/**
 * Replace entire services list (useful for bulk updates)
 */
export const replaceServices = (newServices: Service[], professionalId: number = 1): void => {
  localStorage.setItem(getStorageKey(professionalId), JSON.stringify(newServices));
};

/**
 * Reset services to hardcoded defaults
 */
export const resetServicesToDefaults = (professionalId: number = 1): void => {
  localStorage.removeItem(getStorageKey(professionalId));
};
