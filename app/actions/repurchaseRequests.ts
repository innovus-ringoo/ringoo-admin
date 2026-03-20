'use server';

import { getRepurchaseRequests } from '../services/database';
import { RepurchaseRequest } from '../types';
import { checkAdminRoleServer } from '../lib/auth-server';

export async function getRepurchaseRequestsAction(): Promise<RepurchaseRequest[]> {
  try {
    await checkAdminRoleServer();
    return await getRepurchaseRequests();
  } catch (error) {
    console.error('Failed to fetch repurchase requests:', error);
    return [];
  }
}
