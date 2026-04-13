'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserWalletTransactionsAction } from '../../../../actions/invoices';
import { WalletTransactionUI } from '../../../../types';

export default function UserTransactionsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [transactions, setTransactions] = useState<WalletTransactionUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Set<string>>(new Set());
  
  // Date filter by month (format YYYY-MM) - defaults to current month
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  );

  // Invoice mode
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getUserWalletTransactionsAction(userId);
      setTransactions(data);
    } catch(err: any) {
      setError(err.message || 'Failed to fetch user transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  // Filter transactions by month
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter(tx => {
      const txMonth = new Date(tx.date).toISOString().substring(0, 7);
      return txMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const toggleSelectAll = () => {
    if (selectedTx.size === filteredTransactions.length) {
      setSelectedTx(new Set());
    } else {
      setSelectedTx(new Set(filteredTransactions.map(tx => tx.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedTx);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTx(next);
  };

  // Build the invoice data from selected transactions
  const selectedItems = useMemo(() => {
    return filteredTransactions.filter(tx => selectedTx.has(tx.id));
  }, [filteredTransactions, selectedTx]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.amount, 0);
  }, [selectedItems]);

  const handlePrint = () => {
    window.print();
  };

  if (showInvoice) {
    const now = new Date();
    const invoiceNumber = `INV-${userId.substring(0,6).toUpperCase()}-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
    
    // Attempt to extract userName and email from the first item or fallback.
    // Notice: our WalletTransactionUI doesn't have userName, so we just label it generic or fetch it.
    // We already have generic "User" placeholders since we didn't fetch the user doc directly here.
    
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center no-print">
          <button 
            onClick={() => setShowInvoice(false)}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Selection
          </button>
          <button 
            onClick={handlePrint}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print PDF
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 print:shadow-none print:border-none invoice-container">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .no-print { display: none !important; }
              body { background: white; }
              .invoice-container { padding: 0 !important; border: none !important; }
            }
          `}} />
          
          <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 uppercase">INVOICE</h1>
              <p className="text-gray-500 mt-1">Invoice #{invoiceNumber}</p>
            </div>
            <div className="text-right text-gray-500">
              <p className="font-semibold text-gray-900">Ringoo Admin</p>
              <p>123 Communication St.</p>
              <p>Tech City, TC 12345</p>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <div className="text-gray-600">
              <p className="mb-1 text-sm font-semibold text-gray-500 uppercase">Bill To:</p>
              <p className="text-sm mt-1">User ID: {userId}</p>
              {selectedMonth && <p className="text-sm mt-1">Billing Period: {selectedMonth}</p>}
            </div>
            <div className="text-right text-gray-600">
              <p><span className="font-semibold">Generation Date:</span> {now.toLocaleDateString()}</p>
              <p><span className="font-semibold">Status:</span> 
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Paid
                </span>
              </p>
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.amount.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="w-1/2 sm:w-1/3">
              <div className="flex justify-between py-2 text-gray-600">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
                <span>Tax (0%)</span>
                <span>$0.0000</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${totalAmount.toFixed(4)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center text-sm text-gray-500">
            <p>Thank you for using Ringoo!</p>
            <p>If you have any questions concerning this invoice, contact administration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center no-print">
        <button 
          onClick={() => router.push('/dashboard/users')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </button>
        <div className="flex items-center gap-4">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedTx(new Set()); // Reset selection on filter change
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {selectedTx.size > 0 && (
            <button 
              onClick={() => setShowInvoice(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Invoice ({selectedTx.size})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading transactions...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600">
              {filteredTransactions.length} Transactions found. Select items to generate a combined invoice.
            </span>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={filteredTransactions.length > 0 && selectedTx.size === filteredTransactions.length} 
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      onChange={() => toggleSelect(tx.id)} 
                      checked={selectedTx.has(tx.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                    <span className={`capitalize px-2 py-1 rounded text-xs ${
                      tx.type !== 'spend' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="capitalize px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                      {tx.referenceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {tx.type === 'spend' ? '-' : '+'}${tx.amount.toFixed(4)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No transactions found for this user in the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
