'use server';

import { createPromoCode, updatePromoCode, deletePromoCode } from '../services/database';
import { CreatePromoCodeRequest, PromoCode } from '../types';

export async function createPromoCodeAction(
  prevState: { success: boolean; error: string; data: PromoCode | null },
  data: CreatePromoCodeRequest
) {
  try {
    const newPromoCode = await createPromoCode({
      ...data,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
    });
    return { success: true, data: newPromoCode, error: '' };
  } catch (error) {
    return { success: false, error: 'Failed to create promo code', data: null };
  }
}

export async function updatePromoCodeAction(
  prevState: { success: boolean; error: string; data: PromoCode | null },
  payload: { id: string; data: Partial<CreatePromoCodeRequest> }
) {
  try {
    const updatedPromoCode = await updatePromoCode(payload.id, payload.data);
    if (!updatedPromoCode) {
      return { success: false, error: 'Promo code not found', data: null };
    }
    return { success: true, data: updatedPromoCode, error: '' };
  } catch (error) {
    return { success: false, error: 'Failed to update promo code', data: null };
  }
}

export async function deletePromoCodeAction(
  prevState: { success: boolean; error: string; data: PromoCode | null },
  id: string
) {
  try {
    const deleted = await deletePromoCode(id);
    if (!deleted) {
      return { success: false, error: 'Promo code not found', data: null };
    }
    return { success: true, message: 'Promo code deleted successfully', data: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete promo code', data: null };
  }
}
