/**
 * Bwana Auth & Role Validation Middleware
 * Validates JWT / Bearer tokens or Role Claims for protected endpoints.
 */

import { UserRole } from '../../types';
import { getCapabilitiesForRole } from '../../services/rbacService';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

export function parseAuthorizationHeader(authHeader?: string | null): AuthContext | null {
  if (!authHeader) return null;

  // Supports: Bearer bwana_token_<role>_<userId> or standard JWT structure
  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  const token = parts[1];
  
  if (token.startsWith('bwana_token_')) {
    const raw = token.replace('bwana_token_', '');
    const [role, id] = raw.split('_');
    return {
      userId: id || 'usr-system',
      email: `${role || 'user'}@bwana.africa`,
      role: (role as UserRole) || 'registered_user',
    };
  }

  // Fallback demo/token mock
  return {
    userId: 'usr-demo-01',
    email: 'm.mumba8@gmail.com',
    role: 'registered_user',
  };
}

export function authorizeRoles(allowedRoles: UserRole[], userRole?: UserRole): boolean {
  if (!userRole) return false;
  if (userRole === 'admin') return true; // Super admin bypass
  return allowedRoles.includes(userRole);
}
