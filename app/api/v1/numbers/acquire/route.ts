import { NextRequest, NextResponse } from 'next/server';
import { applyPromoCode } from '../../../../services/promocode';

export interface AcquireNumberRequest {
  name: string;
  number: string;
  country: string;
  monthly_price: string;
  promo_code?: string;
}

export interface AcquireNumberResponse {
  success: boolean;
  numberId?: string;
  finalPrice?: number;
  discountAmount?: number;
  commissionAmount?: number;
  promoCode?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestData: AcquireNumberRequest = await request.json();
    const price = parseFloat(requestData.monthly_price);
    
    let finalPrice = price;
    let discountAmount = 0;
    let commissionAmount = 0;
    let promoCodeData = null;

    // Apply promo code if provided
    if (requestData.promo_code) {
      const applyResult = await applyPromoCode({
        code: requestData.promo_code,
        price: price,
        userId: 'test-user-123', // Mock user ID
        numberId: `number-${Date.now()}`, // Generate temporary number ID
      });

      if (!applyResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Promo code error: ${applyResult.error}` 
          },
          { status: 400 }
        );
      }

      finalPrice = applyResult.finalPrice!;
      discountAmount = applyResult.discountAmount!;
      commissionAmount = applyResult.commissionAmount || 0;
      promoCodeData = applyResult.promoCode;
    }

    // Simulate number acquisition process
    const numberId = `number-${Date.now()}`;

    // In a real system, this would:
    // 1. Check availability of the number
    // 2. Create a number record in the database
    // 3. Process payment with the final price
    // 4. Update user's account with the new number

    return NextResponse.json({
      success: true,
      numberId,
      finalPrice,
      discountAmount,
      commissionAmount,
      promoCode: promoCodeData,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to acquire number. Please try again.' 
      },
      { status: 500 }
    );
  }
}