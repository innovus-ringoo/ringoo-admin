'use server';

import {
  getRepurchaseRequests,
  updateRepurchaseRequestStatus,
  activateAcquiredNumber,
  deductWalletBalance,
} from '../services/database';
import { RepurchaseRequest } from '../types';
import { checkAdminRoleServer } from '../lib/auth-server';
import { getDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getRepurchaseRequestsAction(): Promise<RepurchaseRequest[]> {
  try {
    await checkAdminRoleServer();
    return await getRepurchaseRequests();
  } catch (error) {
    console.error('Failed to fetch repurchase requests:', error);
    return [];
  }
}

export async function updateRepurchaseRequestAction(
  id: string,
  status: 'accepted' | 'rejected',
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminRoleServer();

    if (status === 'accepted') {
      // Fetch full request details needed for activation
      const db = await getDatabase();
      const doc = await db.collection('repurchase_requests').findOne({ _id: new ObjectId(id) });
      if (!doc) return { success: false, error: 'Request not found' };

      const monthlyPrice = doc.monthly_price ?? '0';
      const billingCycle = doc.billing_cycle ?? 'monthly';
      const userId = doc.user_id?.toString();
      const numberId = doc.number_id?.toString();
      const number = doc.number ?? '';

      const billingCycleMonths: Record<string, number> = { monthly: 1, quarterly: 3, annually: 12 };
      const months = billingCycleMonths[billingCycle] ?? 1;
      const totalAmount = parseFloat(monthlyPrice) * months;

      // 1. Deduct wallet
      const walletResult = await deductWalletBalance(
        userId,
        totalAmount,
        `Repurchase of number ${number} (${billingCycle})`,
        id
      );
      if (!walletResult.success) {
        return { success: false, error: walletResult.error };
      }

      // 2. Activate number
      await activateAcquiredNumber(numberId, billingCycle, monthlyPrice);
    }

    // 3. Update request status
    const updated = await updateRepurchaseRequestStatus(id, status, adminNote);
    if (!updated) return { success: false, error: 'Request not found or already updated' };

    return { success: true };
  } catch (error) {
    console.error('Failed to update repurchase request:', error);
    return { success: false, error: 'Failed to update request' };
  }
}
