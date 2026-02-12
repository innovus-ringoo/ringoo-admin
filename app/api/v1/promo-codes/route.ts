import { NextRequest, NextResponse } from 'next/server';
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, getPromoCodeById } from '../../../services/database';
import { CreatePromoCodeRequest } from '../../../types';
import { checkAdminRole } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const promoCodes = await getPromoCodes();
    return NextResponse.json(promoCodes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const promoCodeData: CreatePromoCodeRequest = await request.json();
    const newPromoCode = await createPromoCode({
      ...promoCodeData,
      validFrom: promoCodeData.validFrom,
      validUntil: promoCodeData.validUntil,
    });
    return NextResponse.json(newPromoCode, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const updatedPromoCode = await updatePromoCode(id, updateData);
    if (!updatedPromoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPromoCode);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deletePromoCode(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}