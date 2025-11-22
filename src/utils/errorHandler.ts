import { ApiError } from '../types/api';

/**
 * Extrae el mensaje de error desde la respuesta de Axios.
 *
 * El backend devuelve un objeto ApiError con:
 * - error: nombre del error HTTP (ej: "Bad Request", "Unauthorized")
 * - message: mensaje descriptivo para el usuario (ej: "Credenciales inválidas")
 *
 * Esta función prioriza el campo 'message' que es el más útil para mostrar.
 *
 * @param error - Error de Axios o cualquier error
 * @param defaultMessage - Mensaje por defecto si no se puede extraer el error
 * @returns Mensaje de error para mostrar al usuario
 */
export const getErrorMessage = (
  error: any,
  defaultMessage: string = 'Ha ocurrido un error'
): string => {
  // Verificar si hay una respuesta del backend
  if (error.response?.data) {
    const apiError = error.response.data as ApiError;

    // Priorizar el campo 'message' que contiene el mensaje descriptivo
    if (apiError.message) {
      return apiError.message;
    }

    // Fallback al campo 'error' si no hay message
    if (apiError.error) {
      return apiError.error;
    }
  }

  // Si no hay response.data, usar el mensaje de Axios
  if (error.message) {
    return error.message;
  }

  // Último fallback
  return defaultMessage;
};
