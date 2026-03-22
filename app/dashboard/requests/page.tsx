'use client';

import { useState, useEffect } from 'react';
import { getRepurchaseRequestsAction, updateRepurchaseRequestAction } from '../../actions/repurchaseRequests';
import { RepurchaseRequest } from '../../types';

export default function RequestsPage() {
  const [requests, setRequests] = useState<RepurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getRepurchaseRequestsAction();
        setRequests(data);
      } catch {
        setError('Failed to load repurchase requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    setActionLoading(`${id}-${status}`);
    setActionError(null);
    const result = await updateRepurchaseRequestAction(id, status);
    if (result.success) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } else {
      setActionError({ id, message: result.error || 'Failed to update request' });
    }
    setActionLoading(null);
  };

  const statusColor = (status: string) => {
    if (status === 'accepted') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto Renew</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors border-t border-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.monthlyPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{req.billingCycle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.autoRenew ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.adminNote || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {req.status === 'pending' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(req.id!, 'accepted')}
                            disabled={!!actionLoading}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === `${req.id}-accepted` ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            ) : (
                              'Accept'
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id!, 'rejected')}
                            disabled={!!actionLoading}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === `${req.id}-rejected` ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            ) : (
                              'Reject'
                            )}
                          </button>
                        </div>
                        {actionError?.id === req.id && (
                          <p className="text-xs text-red-600 max-w-[180px]">{actionError?.message}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && requests.length === 0 && !error && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No repurchase requests found</p>
            </div>
          )}

          {loading && (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
