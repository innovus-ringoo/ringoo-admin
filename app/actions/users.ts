'use server';

import { getUsers } from '../services/database';
import { UserListResponse } from '../types';
import { checkAdminRoleServer } from '../lib/auth-server';

export async function getUsersAction(limit: number = 10, cursor?: string, search?: string): Promise<UserListResponse> {
  try {
    await checkAdminRoleServer();
    const result = await getUsers(limit, cursor, search);
    return {
      users: result.users,
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return {
      users: [],
      nextCursor: undefined,
      hasNext: false,
    };
  }
}
