'use server';

import { createOffer, updateOffer, deleteOffer } from '../services/offers';
import { CreateOfferRequest, Offer } from '../types';
import { checkAdminRoleServer } from '../lib/auth-server';

export async function createOfferAction(
  prevState: { success: boolean; error: string; data: Offer | null },
  data: CreateOfferRequest
) {
  try {
    await checkAdminRoleServer();
    const newOffer = await createOffer(data);
    return { success: true, data: newOffer, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create offer', data: null };
  }
}

export async function updateOfferAction(
  prevState: { success: boolean; error: string; data: Offer | null },
  payload: { id: string; data: Partial<CreateOfferRequest> }
) {
  try {
    await checkAdminRoleServer();
    const updatedOffer = await updateOffer(payload.id, payload.data);
    if (!updatedOffer) {
      return { success: false, error: 'Offer not found', data: null };
    }
    return { success: true, data: updatedOffer, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update offer', data: null };
  }
}

export async function deleteOfferAction(
  prevState: { success: boolean; error: string; data: Offer | null },
  id: string
) {
  try {
    await checkAdminRoleServer();
    const deleted = await deleteOffer(id);
    if (!deleted) {
      return { success: false, error: 'Offer not found', data: null };
    }
    return { success: true, data: null, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete offer', data: null };
  }
}
