import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Check if user has admin role
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = await getToken({ req: request });
  return token?.role === 'admin';
}

// Get current user's role
export async function getUserRole(request: NextRequest): Promise<string> {
  const token = await getToken({ req: request });
  return token?.role || 'user';
}

// Admin role middleware helper
export async function checkAdminRole(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    return {
      authorized: false,
      error: 'Not authenticated',
      status: 401
    };
  }

  if (token.role !== 'admin') {
    return {
      authorized: false,
      error: 'Unauthorized: Admin access required',
      status: 403
    };
  }

  return {
    authorized: true,
    user: {
      id: token.id,
      email: token.email,
      name: token.name,
      role: token.role
    }
  };
}
