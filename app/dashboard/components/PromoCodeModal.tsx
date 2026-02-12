'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '../../components/Modal';
import { PromoCode, Agency } from '../../types';
import { createPromoCodeAction, updatePromoCodeAction } from '../../actions/promoCodes';
import { getAgenciesAction } from '../../actions/agencies';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

interface PromoCodeModalProps {
  mode: 'create' | 'edit';
  promoCode?: PromoCode;
}

type FormState = {
  success: boolean;
  error: string;
  data: PromoCode | null;
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

export default function PromoCodeModal({ mode, promoCode }: PromoCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [promoType, setPromoType] = useState(promoCode?.type || 'user');
  const [agencies, setAgencies] = useState<Agency[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchAgencies = async () => {
        const agenciesList = await getAgenciesAction();
        setAgencies(agenciesList);
      };
      fetchAgencies();
    }
  }, [isOpen]);
  
  const handleCreateSubmit = async (prevState: FormState, formData: FormData) => {
    const data = {
      code: formData.get('code') as string,
      type: formData.get('type') as 'user' | 'agency',
      discountType: formData.get('discountType') as 'percentage' | 'fixed',
      discountValue: parseFloat(formData.get('discountValue') as string),
      maxDiscount: formData.get('maxDiscount') ? parseFloat(formData.get('maxDiscount') as string) : undefined,
      minPurchase: formData.get('minPurchase') ? parseFloat(formData.get('minPurchase') as string) : undefined,
      usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : undefined,
      usageLimitPerUser: formData.get('usageLimitPerUser') ? parseInt(formData.get('usageLimitPerUser') as string) : undefined,
      validFrom: formData.get('validFrom') as string,
      validUntil: formData.get('validUntil') as string,
      status: formData.get('status') as 'active' | 'inactive' | 'expired',
      agencyId: formData.get('agencyId') as string || undefined,
      agencyName: agencies.find(a => a.id === formData.get('agencyId') as string)?.name,
      commissionRate: formData.get('commissionRate') ? parseFloat(formData.get('commissionRate') as string) : undefined,
      applicableNumbers: formData.get('applicableNumbers') ? (formData.get('applicableNumbers') as string).split(',').map(s => s.trim()) : undefined,
      isFirstPurchase: formData.get('isFirstPurchase') === 'on',
      description: formData.get('description') as string || undefined,
    };
    
    return createPromoCodeAction(prevState, data);
  };

  const handleEditSubmit = async (prevState: FormState, formData: FormData) => {
    if (!promoCode) return prevState;
    
    const data = {
      code: formData.get('code') as string,
      type: formData.get('type') as 'user' | 'agency',
      discountType: formData.get('discountType') as 'percentage' | 'fixed',
      discountValue: parseFloat(formData.get('discountValue') as string),
      maxDiscount: formData.get('maxDiscount') ? parseFloat(formData.get('maxDiscount') as string) : undefined,
      minPurchase: formData.get('minPurchase') ? parseFloat(formData.get('minPurchase') as string) : undefined,
      usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : undefined,
      usageLimitPerUser: formData.get('usageLimitPerUser') ? parseInt(formData.get('usageLimitPerUser') as string) : undefined,
      validFrom: formData.get('validFrom') as string,
      validUntil: formData.get('validUntil') as string,
      status: formData.get('status') as 'active' | 'inactive' | 'expired',
      agencyId: formData.get('agencyId') as string || undefined,
      agencyName: agencies.find(a => a.id === formData.get('agencyId') as string)?.name,
      commissionRate: formData.get('commissionRate') ? parseFloat(formData.get('commissionRate') as string) : undefined,
      applicableNumbers: formData.get('applicableNumbers') ? (formData.get('applicableNumbers') as string).split(',').map(s => s.trim()) : undefined,
      isFirstPurchase: formData.get('isFirstPurchase') === 'on',
      description: formData.get('description') as string || undefined,
    };
    
    return updatePromoCodeAction(prevState, { id: promoCode.id, data });
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
        {mode === 'create' ? 'Create Promo Code' : 'Edit'}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={mode === 'create' ? 'Create Promo Code' : 'Edit Promo Code'}
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
              Promo Code
            </label>
            <input
              type="text"
              name="code"
              required
              defaultValue={promoCode?.code}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter promo code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              required
              defaultValue={promoCode?.type}
              onChange={(e) => setPromoType(e.target.value as 'user' | 'agency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="agency">Agency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type
            </label>
            <select
              name="discountType"
              required
              defaultValue={promoCode?.discountType}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value
            </label>
            <input
              type="number"
              name="discountValue"
              required
              defaultValue={promoCode?.discountValue}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter discount value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Discount (optional)
            </label>
            <input
              type="number"
              name="maxDiscount"
              defaultValue={promoCode?.maxDiscount}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter max discount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Purchase (optional)
            </label>
            <input
              type="number"
              name="minPurchase"
              defaultValue={promoCode?.minPurchase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter minimum purchase amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit (optional)
            </label>
            <input
              type="number"
              name="usageLimit"
              defaultValue={promoCode?.usageLimit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter usage limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit Per User (optional)
            </label>
            <input
              type="number"
              name="usageLimitPerUser"
              defaultValue={promoCode?.usageLimitPerUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter per user limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid From
            </label>
            <input
              type="date"
              name="validFrom"
              required
              defaultValue={promoCode?.validFrom?.split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid Until
            </label>
            <input
              type="date"
              name="validUntil"
              required
              defaultValue={promoCode?.validUntil?.split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              required
              defaultValue={promoCode?.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {promoType === 'agency' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency
              </label>
              <select
                name="agencyId"
                required
                defaultValue={promoCode?.agencyId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              >
                <option value="">Select an agency</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              defaultValue={promoCode?.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter description"
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
