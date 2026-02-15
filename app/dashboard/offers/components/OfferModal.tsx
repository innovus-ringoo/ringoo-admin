'use client';

import { useState, useRef } from 'react';
import Modal from '../../../components/Modal';
import { Offer } from '../../../types';
import { createOfferAction, updateOfferAction } from '../../../actions/offers';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

interface OfferModalProps {
  mode: 'create' | 'edit';
  offer?: Offer;
}

type FormState = {
  success: boolean;
  error: string;
  data: Offer | null;
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

export default function OfferModal({ mode, offer }: OfferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(offer?.imageUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      setImageUrl(url);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async (prevState: FormState, formData: FormData) => {
    const data = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      type: formData.get('type') as 'banner' | 'promo' | 'announcement',
      placement: formData.get('placement') as 'home_top' | 'home_bottom' | 'calls_banner' | 'settings',
      imageUrl: imageUrl || undefined,
      ctaText: (formData.get('ctaText') as string) || undefined,
      ctaLink: (formData.get('ctaLink') as string) || undefined,
      discountCode: (formData.get('discountCode') as string) || undefined,
      priority: parseInt(formData.get('priority') as string) || 0,
      isActive: formData.get('isActive') === 'true',
      startDate: (formData.get('startDate') as string) || undefined,
      endDate: (formData.get('endDate') as string) || undefined,
    };

    return createOfferAction(prevState, data);
  };

  const handleEditSubmit = async (prevState: FormState, formData: FormData) => {
    if (!offer) return prevState;

    const data = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      type: formData.get('type') as 'banner' | 'promo' | 'announcement',
      placement: formData.get('placement') as 'home_top' | 'home_bottom' | 'calls_banner' | 'settings',
      imageUrl: imageUrl || undefined,
      ctaText: (formData.get('ctaText') as string) || undefined,
      ctaLink: (formData.get('ctaLink') as string) || undefined,
      discountCode: (formData.get('discountCode') as string) || undefined,
      priority: parseInt(formData.get('priority') as string) || 0,
      isActive: formData.get('isActive') === 'true',
      startDate: (formData.get('startDate') as string) || undefined,
      endDate: (formData.get('endDate') as string) || undefined,
    };

    return updateOfferAction(prevState, { id: offer.id!, data });
  };

  const [state, dispatch] = useActionState<FormState, FormData>(
    mode === 'create' ? handleCreateSubmit : handleEditSubmit,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  if (state.success) {
    setIsOpen(false);
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
        {mode === 'create' ? 'Create Offer' : 'Edit'}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={mode === 'create' ? 'Create Offer' : 'Edit Offer'}
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
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={offer?.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter offer title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              defaultValue={offer?.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              required
              defaultValue={offer?.type || 'banner'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="banner">Banner</option>
              <option value="promo">Promo</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placement
            </label>
            <select
              name="placement"
              required
              defaultValue={offer?.placement || 'home_top'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="home_top">Home Top</option>
              <option value="home_bottom">Home Bottom</option>
              <option value="calls_banner">Calls Banner</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            {imageUrl && (
              <div className="mb-2">
                <img
                  src={imageUrl}
                  alt="Offer preview"
                  className="h-20 w-auto rounded border border-gray-200"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA Text (optional)
            </label>
            <input
              type="text"
              name="ctaText"
              defaultValue={offer?.ctaText}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="e.g. Shop Now"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA Link (optional)
            </label>
            <input
              type="text"
              name="ctaLink"
              defaultValue={offer?.ctaLink}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="e.g. https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code (optional)
            </label>
            <input
              type="text"
              name="discountCode"
              defaultValue={offer?.discountCode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Enter discount code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              required
              defaultValue={offer?.priority ?? 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
              placeholder="Lower number = higher priority"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="isActive"
              required
              defaultValue={offer?.isActive !== false ? 'true' : 'false'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date (optional)
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={offer?.startDate?.split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (optional)
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={offer?.endDate?.split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A93FF] focus:border-transparent"
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
