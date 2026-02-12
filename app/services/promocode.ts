import { PromoCode, ValidatePromoCodeRequest, ValidatePromoCodeResponse, ApplyPromoCodeRequest, ApplyPromoCodeResponse } from '../types';
import { 
  getPromoCodeByCode, 
  getPromoCodeUsages, 
  createPromoCodeUsage, 
  updatePromoCode, 
  getAgencyById,
  updateAgency,
  getAgencyDashboard
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

  // Check validity dates
  const now = new Date();
  if (now < new Date(promoCode.validFrom) || now > new Date(promoCode.validUntil)) {
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
  if (userId && promoCode.usageLimitPerUser && promoCode.usageLimitPerUser > 0) {
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

  // Update promo code usage count
  await updatePromoCode(promoCode.id, {
    usageCount: promoCode.usageCount + 1,
  });

  // Update agency referral count and earnings
  if (promoCode.type === 'agency' && promoCode.agencyId) {
    const agency = await getAgencyById(promoCode.agencyId);
    if (agency) {
      await updateAgency(promoCode.agencyId, {
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