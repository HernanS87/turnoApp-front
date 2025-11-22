import { Client } from '../types';
import { CLIENTS } from '../data/clients';

/**
 * Get all clients (hardcoded + localStorage)
 * Merges hardcoded clients with dynamically registered clients
 */
export const getAllClients = (): Client[] => {
  const stored = localStorage.getItem('clients');
  const storedClients: Client[] = stored ? JSON.parse(stored) : [];

  // Merge hardcoded clients with stored ones
  return [...CLIENTS, ...storedClients];
};

/**
 * Get client by ID
 * Searches in both hardcoded and localStorage clients
 */
export const getClientById = (clientId: number): Client | undefined => {
  return getAllClients().find(c => c.id === clientId);
};

/**
 * Get client by email
 * Searches in both hardcoded and localStorage clients
 */
export const getClientByEmail = (email: string): Client | undefined => {
  return getAllClients().find(c => c.email === email);
};
