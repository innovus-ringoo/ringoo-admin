'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvoiceForTransactionAction } from '../../../../../actions/invoices';
import { InvoiceData } from '../../../../../types';

export default function PrintTransactionInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const transactionId = params.invoiceId as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await getInvoiceForTransactionAction(userId, transactionId);
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch invoice');
      } finally {
        setLoading(false);
      }
    };
    if (transactionId) {
      fetchInvoice();
    }
  }, [userId, transactionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading invoice...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!invoice) return <div className="text-center py-20 text-gray-500">Invoice not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center no-print">
        <button 
          onClick={() => router.push(`/dashboard/users/${userId}/invoice`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Transactions
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
            <p className="text-gray-500 mt-1">Invoice #{invoice.invoiceId}</p>
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
            <p className="text-gray-900 font-semibold">{invoice.userName}</p>
            <p>{invoice.userEmail}</p>
            <p className="text-sm mt-1">User ID: {invoice.userId}</p>
          </div>
          <div className="text-right text-gray-600">
            <p><span className="font-semibold">Transaction Date:</span> {new Date(invoice.date).toLocaleString()}</p>
            <p><span className="font-semibold">Status:</span> 
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {invoice.status}
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
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <div className="w-1/2 sm:w-1/3">
            <div className="flex justify-between py-2 text-gray-600">
              <span>Subtotal</span>
              <span>${invoice.totalAmount.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
              <span>Tax (0%)</span>
              <span>$0.0000</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${invoice.totalAmount.toFixed(4)}</span>
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
