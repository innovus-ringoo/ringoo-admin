import { ObjectId } from 'mongodb';
import { getDatabase } from '../lib/mongodb';
import { InvoiceData, InvoiceItem, WalletTransactionUI } from '../types';

const WALLET_TRANSACTIONS_COLLECTION = 'wallet_transactions';
const USERS_COLLECTION = 'users';

export const getUserWalletTransactions = async (userId: string): Promise<WalletTransactionUI[]> => {
  const db = await getDatabase();
  const transactions = await db.collection(WALLET_TRANSACTIONS_COLLECTION)
    .find({ user_id: new ObjectId(userId) })
    .sort({ created_at: -1 })
    .toArray();

  return transactions.map(t => ({
    id: t._id.toString(),
    date: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
    description: t.description || 'Service usage',
    amount: t.amount_cents !== undefined 
      ? Math.abs(Number(t.amount_cents)) / 100 
      : t.amount !== undefined 
        ? Math.abs(Number(t.amount)) 
        : 0,
    type: t.type || 'unknown',
    referenceType: t.status || 'posted',
    invoiced: true
  }));
};

export const getInvoiceForTransaction = async (userId: string, transactionId: string): Promise<InvoiceData | null> => {
  const db = await getDatabase();
  
  const userObjectId = new ObjectId(userId);
  const transactionObjectId = new ObjectId(transactionId);
  
  const user = await db.collection(USERS_COLLECTION).findOne({ _id: userObjectId });
  if (!user) return null;

  const transaction = await db.collection(WALLET_TRANSACTIONS_COLLECTION).findOne({ 
    _id: transactionObjectId,
    user_id: userObjectId
  });

  if (!transaction) return null;

  let amount = 0;
  if (transaction.amount_cents !== undefined && transaction.amount_cents !== null) {
    amount = Math.abs(Number(transaction.amount_cents)) / 100;
  } else if (transaction.amount !== undefined && transaction.amount !== null) {
    amount = Math.abs(Number(transaction.amount));
  }
  
  const item: InvoiceItem = {
    id: transaction._id.toString(),
    date: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
    description: transaction.description || 'Service transaction',
    amount: amount,
    type: transaction.type || 'usage'
  };

  const now = new Date();
  const dateStr = transaction.created_at ? new Date(transaction.created_at) : now;
  const formattedDateStr = `${dateStr.getFullYear()}${(dateStr.getMonth()+1).toString().padStart(2, '0')}${dateStr.getDate().toString().padStart(2,'0')}`;
  const invNumber = `INV-${userId.substring(0,6).toUpperCase()}-${formattedDateStr}-${transactionId.substring(0,4).toUpperCase()}`;

  return {
    userId: userId,
    userName: user.username || user.name || 'Unknown User',
    userEmail: user.email || '',
    invoiceId: invNumber,
    date: item.date,
    transactionIds: [transactionId],
    items: [item],
    totalAmount: amount,
    status: 'Paid'
  };
};
