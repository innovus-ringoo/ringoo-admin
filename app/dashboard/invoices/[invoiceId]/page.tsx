'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InvoiceData } from '../../../types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to fetch invoice');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsPaid = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Paid' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      // Refresh the invoice data
      window.location.reload();
    } catch (err: unknown) {
      console.error('Failed to mark invoice as paid:', err);
      alert('Failed to mark invoice as paid');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-20">
        <div className="text-red-600">{error || 'Invoice not found'}</div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Unpaid
        </span>
      );
    }

    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center no-print">
        <button
          onClick={() => router.push('/dashboard/invoices')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Invoices
        </button>
        <div className="flex gap-2">
          {(!invoice.status || invoice.status === 'Pending') && (
            <button
              onClick={handleMarkAsPaid}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2 text-sm"
            >
              Mark as Paid
            </button>
          )}
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
            <p className="font-semibold text-gray-900">Ringoo Communication</p>
            <p>24880 Myers Glen Place</p>
            <p>Chantilly, VA 20152</p>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="text-gray-600">
            <p className="mb-1 text-sm font-semibold text-gray-500 uppercase">Bill To:</p>
            <p className="text-sm mt-1">{invoice.userName}</p>
            <p className="text-sm mt-1">{invoice.userEmail}</p>
            {invoice.billingPeriod && <p className="text-sm mt-1">Billing Period: {invoice.billingPeriod}</p>}
          </div>
          <div className="text-right text-gray-600">
            <p><span className="font-semibold">Invoice Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> {getStatusBadge(invoice.status)}</p>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usages Details</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.categorizedItems ? (
                invoice.categorizedItems.map((item, index) => {
                  // Split the description into service and usage details
                  let service = '';
                  let usageDetails = '';

                  switch (item.category) {
                    case 'subscription_fee':
                      service = 'User Subscription';
                      usageDetails = 'Access to ringoo cloud Telephony platform with global calling feature';
                      break;
                    case 'purchase_number':
                      service = 'Virtual Numbers';
                      usageDetails = 'Active virtual number for communication';
                      break;
                    case 'call_usages':
                      service = 'Voice Usages';
                      usageDetails = 'Charges for inbound and outbound calls';
                      break;
                    case 'sms_usages':
                      service = 'SMS Usages';
                      usageDetails = 'Charges for inbound and outbound SMS';
                      break;
                    default:
                      service = item.description.split(' ')[0] || 'Service';
                      usageDetails = item.description.split(' ').slice(1).join(' ') || 'Usage';
                  }

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">{service}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{usageDetails}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.amount.toFixed(4)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Fallback to legacy items if categorizedItems not available
                invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description.split(' ')[0] || 'Service'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description.split(' ').slice(1).join(' ') || 'Usage'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.amount.toFixed(4)}
                    </td>
                  </tr>
                ))
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