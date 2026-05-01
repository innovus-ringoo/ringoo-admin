'use server';

import { getUserWalletTransactions, getInvoiceForTransaction, saveInvoice } from '../services/invoices';
import { InvoiceData, WalletTransactionUI } from '../types';

export async function getUserWalletTransactionsAction(userId: string): Promise<WalletTransactionUI[]> {
  try {
    return await getUserWalletTransactions(userId);
  } catch (error) {
    console.error('Failed to get user transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
}

export async function getInvoiceForTransactionAction(userId: string, transactionId: string): Promise<InvoiceData | null> {
  try {
    return await getInvoiceForTransaction(userId, transactionId);
  } catch (error) {
    console.error('Failed to get transaction invoice:', error);
    throw new Error('Failed to fetch invoice details');
  }
}

export async function saveInvoiceAction(invoiceData: Omit<InvoiceData, '_id'>): Promise<string> {
  try {
    return await saveInvoice(invoiceData);
  } catch (error) {
    console.error('Failed to save invoice:', error);
    throw new Error('Failed to save invoice');
  }
}
