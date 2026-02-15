'use client';

import { useActionState } from 'react';
import { deleteOfferAction } from '../../../actions/offers';
import { Offer } from '../../../types';

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

export default function DeleteOfferButton({ offerId }: { offerId: string }) {
  const handleDelete = async (prevState: FormState) => {
    if (!confirm('Are you sure you want to delete this offer?')) {
      return prevState;
    }
    return deleteOfferAction(prevState, offerId);
  };

  const [state, dispatch] = useActionState<FormState, FormData>(
    handleDelete,
    initialState
  );

  if (state.success) {
    window.location.reload();
  }

  return (
    <form action={dispatch} style={{ display: 'inline' }}>
      <button
        type="submit"
        className="text-red-600 hover:text-red-800 text-xs font-medium"
      >
        Delete
      </button>
    </form>
  );
}
