import { UserRole } from '../types';

/**
 * Retrieves the stored JWT authentication token.
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('cg_token');
  } catch {
    return null;
  }
};

/**
 * Builds HTTP headers including Authorization Bearer token.
 * Pass contentType=null when uploading FormData.
 */
export const getAuthHeaders = (contentType: string | null = 'application/json'): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Normalizes any role string into a canonical UserRole.
 * Handles case variations ('Admin', 'ADMIN', 'staff', 'Technician', etc.)
 */
export const normalizeRole = (rawRole?: string | null): UserRole => {
  if (!rawRole) return 'student';
  const clean = rawRole.toLowerCase().trim();

  if (clean === 'admin' || clean === 'administrator' || clean === 'chief') {
    return 'admin';
  }
  if (clean === 'maintenance' || clean === 'staff' || clean === 'technician') {
    return 'maintenance';
  }
  return 'student';
};
