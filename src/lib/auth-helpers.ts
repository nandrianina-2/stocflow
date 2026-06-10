import { auth } from './auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  if (!session) redirect('/login');
  return session;
}

export async function requirePermission(permission: string) {
  const session = await auth();
  if (!session) redirect('/login');

  const isAdmin   = session.user.role === 'admin';
  const hasPermission = session.user.permissions?.includes(permission);

  if (!isAdmin && !hasPermission) redirect('/unauthorized');

  return session;
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions?.includes('admin') || permissions?.includes(permission);
}