import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'nipania-trust-secure-jwt-secret-key-2026-super-token';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['donations', 'compliance', 'volunteers', 'certificates', 'projects', 'events', 'gallery', 'content', 'documents', 'messages', 'settings', 'id_cards'],
  FINANCE_MANAGER: ['donations', 'compliance', 'donors', 'reports'],
  VOLUNTEER_MANAGER: ['volunteers', 'id_cards', 'certificates', 'events'],
  CONTENT_MANAGER: ['content', 'projects', 'events', 'gallery', 'documents', 'news'],
  PROJECT_MANAGER: ['projects', 'events', 'certificates', 'reports'],
  VIEWER: ['view_only'],
};

export function signJwt(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const token = req.cookies.get('auth_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyJwt(token);
}

export function hasPermission(role: string, module: string): boolean {
  if (role === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(module);
}
