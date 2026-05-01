'use server';

import { getUsers, getUserById } from '../services/database';
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

export async function getUserByIdAction(id: string) {
  try {
    await checkAdminRoleServer();
    return await getUserById(id);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
