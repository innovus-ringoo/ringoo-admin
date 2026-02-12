'use client';

import { useState, useRef } from 'react';
import Modal from '../../../components/Modal';
import { Agency } from '../../../types';
import { createAgencyAction, updateAgencyAction } from '../../../actions/agencies';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

interface AgencyModalProps {
  mode: 'create' | 'edit';
  agency?: Agency;
}

type FormState = {
  success: boolean;
  error: string;
  data: Agency | null;
};

const initialState: FormState = {
  success: false,
  error: '',
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 px-4 py-2 bg-[#2A93FF] text-white rounded-lg hover:bg-[#1e77d3] transition-colors disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}

export default function AgencyModal({ mode, agency }: AgencyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCreateSubmit = async (prevState: FormState, formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      commissionRate: parseFloat(formData.get('commissionRate') as string),
      status: formData.get('status') as string,
      bankDetails: formData.get('bankDetails') as string || undefined,
    };
    
    return createAgencyAction(prevState, data);
  };

  const handleEditSubmit = async (prevState: FormState, formData: FormData) => {
    if (!agency) return prevState;
    
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      commissionRate: parseFloat(formData.get('commissionRate') as string),
      status: formData.get('status') as string,
      bankDetails: formData.get('bankDetails') as string || undefined,
    };
    
    return updateAgencyAction(prevState, { id: agency.id, data });
  };

  const [state, dispatch] = useActionState<FormState, FormData>(
    mode === 'create' ? handleCreateSubmit : handleEditSubmit,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  if (state.success) {
    setIsOpen(false);
    // Refresh the page to show updated data
    window.location.reload();
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded transition-colors ${
          mode === 'create' 
            ? 'bg-[#2A93FF] hover:bg-[#1e77d3] text-white' 
            : 'text-[#2A93FF] hover:text-[#1e77d3] text-xs font-medium'
        }`}
      >
        {mode === 'create' ? 'Create Agency' : 'Edit'}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={mode === 'create' ? 'Create Agency' : 'Edit Agency'}
      >
        <form 
          ref={formRef}
          action={dispatch} 
          className="space-y-4"
        >
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={agency?.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter agency name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={agency?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              name="commissionRate"
              required
              defaultValue={agency?.commissionRate}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter commission rate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              required
              defaultValue={agency?.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Details (optional)
            </label>
            <textarea
              name="bankDetails"
              defaultValue={agency?.bankDetails}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter bank details"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
