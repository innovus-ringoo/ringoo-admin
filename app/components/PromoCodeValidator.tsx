'use client';

import { useState } from 'react';
import { ValidatePromoCodeRequest, ValidatePromoCodeResponse } from '../types';

interface PromoCodeValidatorProps {
  onValidationSuccess?: (result: ValidatePromoCodeResponse) => void;
  initialPrice?: number;
}

export default function PromoCodeValidator({ onValidationSuccess, initialPrice = 100 }: PromoCodeValidatorProps) {
  const [promoCode, setPromoCode] = useState('');
  const [price, setPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidatePromoCodeResponse | null>(null);

  const handleValidate = async () => {
    if (!promoCode.trim()) {
      setResult({ valid: false, error: 'Please enter a promo code' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode,
          price: price,
          userId: 'test-user-123',
        } as ValidatePromoCodeRequest),
      });

      const data: ValidatePromoCodeResponse = await response.json();
      setResult(data);

      if (data.valid && onValidationSuccess) {
        onValidationSuccess(data);
      }
    } catch (error) {
      setResult({
        valid: false,
        error: 'Failed to validate promo code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Promo Code Validator</h2>
      
      <div className="mb-4">
        <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-1">
          Promo Code
        </label>
        <input
          type="text"
          id="promoCode"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Enter promo code"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Purchase Price ($)
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          placeholder="Enter price"
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleValidate}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Validating...' : 'Validate Promo Code'}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {result.valid ? (
            <div>
              <h3 className="text-green-800 font-medium mb-1">Promo Code Valid!</h3>
              <p className="text-sm text-green-700">
                Discount: ${result.discountAmount?.toFixed(2)}
              </p>
              <p className="text-sm text-green-700">
                Final Price: ${result.finalPrice?.toFixed(2)}
              </p>
              {result.promoCode?.description && (
                <p className="text-xs text-green-600 mt-1">
                  {result.promoCode.description}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-red-800 font-medium mb-1">Promo Code Invalid</h3>
              <p className="text-sm text-red-700">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}