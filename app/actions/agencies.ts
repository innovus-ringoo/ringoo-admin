'use server';

import { createAgency, updateAgency } from '../services/database';
import { CreateAgencyRequest, Agency } from '../types';
import { checkAdminRoleServer } from '../lib/auth-server';

type FormState = {
  success: boolean;
  error: string;
  data: Agency | null;
};

export async function createAgencyAction(
  prevState: FormState,
  data: CreateAgencyRequest
) {
  try {
    await checkAdminRoleServer();
    const newAgency = await createAgency(data);
    return { success: true, data: newAgency, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create agency', data: null };
  }
}

export async function updateAgencyAction(
  prevState: FormState,
  payload: { id: string; data: Partial<CreateAgencyRequest> }
) {
  try {
    await checkAdminRoleServer();
    const updatedAgency = await updateAgency(payload.id, payload.data);
    if (!updatedAgency) {
      return { success: false, error: 'Agency not found', data: null };
    }
    return { success: true, data: updatedAgency, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update agency', data: null };
  }
}

export async function getAgenciesAction(): Promise<Agency[]> {
  try {
    await checkAdminRoleServer();
    const { getAgencies } = await import('../services/database');
    return await getAgencies();
  } catch (error) {
    console.error('Failed to fetch agencies:', error);
    return [];
  }
}
