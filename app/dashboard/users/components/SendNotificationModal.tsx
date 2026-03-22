'use client';

import { useState } from 'react';
import Modal from '../../../components/Modal';
import { sendUserNotificationAction } from '../../../actions/notifications';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string; email: string };
}

export default function SendNotificationModal({
  isOpen,
  onClose,
  user,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleClose = () => {
    setTitle('');
    setBody('');
    setResult(null);
    onClose();
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setResult(null);

    const response = await sendUserNotificationAction(user.id, title.trim(), body.trim());

    if (response.success) {
      setResult({
        success: true,
        message: `Notification sent to ${response.sent} device${response.sent !== 1 ? 's' : ''}${
          response.failed ? ` (${response.failed} failed)` : ''
        }.`,
      });
      setTitle('');
      setBody('');
    } else {
      setResult({ success: false, message: response.error || 'Failed to send notification' });
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send Push Notification">
      <div className="space-y-4">
        {/* User info */}
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-gray-700">{user.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message"
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/500</p>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-md px-4 py-3 text-sm ${
              result.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {result.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !title.trim() || !body.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
