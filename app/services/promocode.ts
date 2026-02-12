import { ObjectId } from 'mongodb';
import { ApplyPromoCodeRequest, ApplyPromoCodeResponse, PromoCode, ValidatePromoCodeRequest, ValidatePromoCodeResponse } from '../types';
import {
  createPromoCodeUsage,
  getAgencyById,
  getPromoCodeByCode,
  getPromoCodeUsages,
  updateAgency,
  updatePromoCode
} from './database';

// Validate promo code
export const validatePromoCode = async (req: ValidatePromoCodeRequest): Promise<ValidatePromoCodeResponse> => {
  const { code, price, userId } = req;

  const promoCode = await getPromoCodeByCode(code);
  if (!promoCode) {
    return {
      valid: false,
      error: 'Promo code not found',
    };
  }

  // Check if promo code is active
  if (promoCode.status !== 'active') {
    return {
      valid: false,
      error: 'Promo code is not active',
    };
  }

  // Check validity dates (ensure all comparisons are in UTC)
  const now = new Date();
  const nowUTC = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  ));
  
  const validFrom = new Date(promoCode.validFrom);
  const validFromUTC = new Date(Date.UTC(
    validFrom.getFullYear(),
    validFrom.getMonth(),
    validFrom.getDate(),
    validFrom.getHours(),
    validFrom.getMinutes(),
    validFrom.getSeconds()
  ));
  
  const validUntil = new Date(promoCode.validUntil);
  const validUntilUTC = new Date(Date.UTC(
    validUntil.getFullYear(),
    validUntil.getMonth(),
    validUntil.getDate(),
    validUntil.getHours(),
    validUntil.getMinutes(),
    validUntil.getSeconds()
  ));
  
  if (nowUTC < validFromUTC || nowUTC > validUntilUTC) {
    return {
      valid: false,
      error: 'Promo code has expired or is not yet valid',
    };
  }

  // Check usage limit
  if (promoCode.usageLimit && promoCode.usageLimit > 0 && promoCode.usageCount >= promoCode.usageLimit) {
    return {
      valid: false,
      error: 'Promo code has reached its usage limit',
    };
  }

  // Check per user usage limit
  if (userId && promoCode.usageLimitPerUser && promoCode.usageLimitPerUser > 0 && promoCode.id) {
    const usages = await getPromoCodeUsages(promoCode.id);
    const userUsageCount = usages.filter(usage => usage.userId === userId).length;
    if (userUsageCount >= promoCode.usageLimitPerUser) {
      return {
        valid: false,
        error: 'Promo code has reached its per user usage limit',
      };
    }
  }

  // Check minimum purchase requirement
  if (promoCode.minPurchase && price < promoCode.minPurchase) {
    return {
      valid: false,
      error: `Minimum purchase of $${promoCode.minPurchase} required`,
    };
  }

  // Calculate discount amount
  const discountAmount = calculateDiscount(promoCode, price);
  const finalPrice = price - discountAmount;

  return {
    valid: true,
    promoCode,
    discountAmount,
    finalPrice,
  };
};

// Apply promo code
export const applyPromoCode = async (req: ApplyPromoCodeRequest): Promise<ApplyPromoCodeResponse> => {
  const { code, price, userId, numberId } = req;

  // Validate promo code first
  const validationResult = await validatePromoCode({
    code,
    price,
    userId,
  });

  if (!validationResult.valid) {
    return {
      success: false,
      error: validationResult.error,
    };
  }

  const promoCode = validationResult.promoCode!;
  const discountAmount = validationResult.discountAmount!;
  const finalPrice = validationResult.finalPrice!;

  // Calculate commission if it's an agency referral code
  let commissionAmount = 0;
  if (promoCode.type === 'agency' && promoCode.commissionRate) {
    commissionAmount = (price * promoCode.commissionRate) / 100;
  }

  // Create usage record
  await createPromoCodeUsage({
    promoCodeId: promoCode.id,
    userId,
    numberId,
    discountAmount,
    originalPrice: price,
    finalPrice,
    commissionAmount,
    agencyId: promoCode.agencyId,
  });

  // Update promo code usage count to match actual count in database
  if (promoCode.id) {
    const actualUsageCount = await getPromoCodeUsages(promoCode.id).then(usages => usages.length);
    await updatePromoCode(promoCode.id, {
      usageCount: actualUsageCount,
    });
  }

  // Update agency referral count and earnings
  if (promoCode.type === 'agency' && promoCode.agencyId) {
    const agencyId = promoCode.agencyId instanceof ObjectId 
      ? promoCode.agencyId.toString() 
      : (promoCode.agencyId as string);
    const agency = await getAgencyById(agencyId);
    if (agency) {
      await updateAgency(agencyId, {
        totalReferrals: agency.totalReferrals + 1,
        totalEarnings: agency.totalEarnings + commissionAmount,
        pendingPayout: agency.pendingPayout + commissionAmount,
      });
    }
  }

  return {
    success: true,
    promoCode,
    discountAmount,
    finalPrice,
    commissionAmount,
  };
};

// Calculate discount
const calculateDiscount = (promoCode: PromoCode, price: number): number => {
  if (promoCode.discountType === 'percentage') {
    let discount = (price * promoCode.discountValue) / 100;
    if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
      discount = promoCode.maxDiscount;
    }
    return discount;
  } else {
    // Fixed amount discount
    let discount = promoCode.discountValue;
    if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
      discount = promoCode.maxDiscount;
    }
    if (discount > price) {
      discount = price;
    }
    return discount;
  }
};