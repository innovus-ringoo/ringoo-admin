import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '../../../../services/promocode';
import { ValidatePromoCodeRequest } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const validateData: ValidatePromoCodeRequest = await request.json();
    const result = await validatePromoCode(validateData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}