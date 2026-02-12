// PromoCodeType defines the type of promo code
export type PromoCodeType = 'user' | 'agency';

// DiscountType defines how the discount is calculated
export type DiscountType = 'percentage' | 'fixed';

// PromoCodeStatus defines the status of a promo code
export type PromoCodeStatus = 'active' | 'inactive' | 'expired';

// PromoCode represents a promo code in the system
export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  discountType: DiscountType;
  discountValue: number; // percentage (0-100) or fixed amount
  maxDiscount?: number; // cap for percentage discounts
  minPurchase?: number; // minimum purchase amount
  usageLimit?: number; // total usage limit
  usageLimitPerUser?: number; // per user limit
  usageCount: number; // current usage count
  validFrom: string;
  validUntil: string;
  status: PromoCodeStatus;
  agencyId?: string; // for agency promo codes
  agencyName?: string;
  commissionRate?: number; // commission percentage for agencies
  applicableNumbers?: string[]; // specific number prefixes or IDs
  isFirstPurchase?: boolean; // only for first-time buyers
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// PromoCodeUsage tracks usage of promo codes by users
export interface PromoCodeUsage {
  id: string;
  promoCodeId: string;
  userId: string;
  numberId: string; // the number purchased with this promo
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  commissionAmount?: number; // for agency codes
  agencyId?: string;
  usedAt: string;
}

// AgencyCommission tracks commission earned by marketing agencies
export interface AgencyCommission {
  id: string;
  agencyId: string;
  promoCodeId: string;
  referralCount: number;
  totalCommission: number;
  pendingPayout: number;
  lastUpdatedAt: string;
}

// Agency represents a marketing agency in the system
export interface Agency {
  id: string;
  name: string;
  email: string;
  promoCodeId: string; // Reference to promo_codes collection
  promoCode: string; // For convenience, stores the promo code string
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  commissionRate: number;
  status: string; // active, inactive
  bankDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'user' | 'agency';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'inactive' | 'expired';
  agencyId?: string;
  agencyName?: string;
  commissionRate?: number;
  applicableNumbers?: string[];
  isFirstPurchase?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyCommission {
  id: string;
  agencyId: string;
  promoCodeId: string;
  referralCount: number;
  totalCommission: number;
  pendingPayout: number;
  lastUpdatedAt: string;
}



// ValidatePromoCodeRequest represents a request to validate a promo code
export interface ValidatePromoCodeRequest {
  code: string;
  price: number;
  userId?: string;
}

// ValidatePromoCodeResponse represents the response from validating a promo code
export interface ValidatePromoCodeResponse {
  valid: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
  error?: string;
}

// ApplyPromoCodeRequest represents a request to apply a promo code
export interface ApplyPromoCodeRequest {
  code: string;
  price: number;
  userId: string;
  numberId: string;
}

// ApplyPromoCodeResponse represents the response from applying a promo code
export interface ApplyPromoCodeResponse {
  success: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
  commissionAmount?: number;
  error?: string;
}

// CreatePromoCodeRequest represents a request to create a promo code
export interface CreatePromoCodeRequest {
  code: string;
  type: PromoCodeType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil: string;
  status?: PromoCodeStatus;
  agencyId?: string;
  agencyName?: string;
  commissionRate?: number;
  applicableNumbers?: string[];
  isFirstPurchase?: boolean;
  description?: string;
}

// CreateAgencyRequest represents a request to create an agency
export interface CreateAgencyRequest {
  name: string;
  email: string;
  promoCodeId?: string;
  promoCode?: string; // Optional, since it's generated internally
  totalReferrals?: number;
  totalEarnings?: number;
  pendingPayout?: number;
  commissionRate: number;
  status?: string;
  bankDetails?: string;
}
