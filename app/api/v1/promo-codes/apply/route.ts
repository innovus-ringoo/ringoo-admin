import { NextRequest, NextResponse } from 'next/server';
import { applyPromoCode } from '../../../../services/promocode';
import { ApplyPromoCodeRequest } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const applyData: ApplyPromoCodeRequest = await request.json();
    const result = await applyPromoCode(applyData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
}