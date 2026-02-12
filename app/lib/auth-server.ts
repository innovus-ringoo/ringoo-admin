import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

// Check if current user has admin role (server-side)
export async function isAdminServer(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// Get current user's role (server-side)
export async function getUserRoleServer(): Promise<string> {
  const session = await getServerSession(authOptions);
  return session?.user?.role || 'user';
}

// Admin role check helper for server actions
export async function checkAdminRoleServer() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  if (session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return session.user;
}
