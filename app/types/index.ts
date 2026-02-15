import { ObjectId } from 'mongodb';

// PromoCodeType defines the type of promo code
export type PromoCodeType = 'user' | 'agency';

// DiscountType defines how the discount is calculated
export type DiscountType = 'percentage' | 'fixed';

// PromoCodeStatus defines the status of a promo code
export type PromoCodeStatus = 'active' | 'inactive' | 'expired';

// PromoCode represents a promo code in the system
export interface PromoCode {
  _id?: ObjectId;
  id?: string;
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
  agencyId?: ObjectId | string; // for agency promo codes
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
  _id?: ObjectId;
  id?: string;
  promoCodeId?: ObjectId | string;
  userId?: ObjectId | string;
  numberId?: ObjectId | string; // the number purchased with this promo
  discountAmount?: number;
  originalPrice?: number;
  finalPrice?: number;
  commissionAmount?: number; // for agency codes
  agencyId?: ObjectId | string;
  usedAt?: Date | string;
}

// AgencyCommission tracks commission earned by marketing agencies
export interface AgencyCommission {
  _id?: ObjectId;
  id?: string;
  agencyId: ObjectId | string;
  promoCodeId: ObjectId | string;
  referralCount: number;
  totalCommission: number;
  pendingPayout: number;
  lastUpdatedAt: string;
}

// Agency represents a marketing agency in the system
export interface Agency {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  promoCodeId?: ObjectId | string; // Reference to promo_codes collection
  promoCode?: string; // For convenience, stores the promo code string
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  commissionRate: number;
  status: string; // active, inactive
  bankDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgencyRequest {
  name: string;
  email: string;
  commissionRate: number;
  bankDetails?: string;
}

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
  status: PromoCodeStatus;
  agencyId?: string;
  agencyName?: string;
  commissionRate?: number;
  applicableNumbers?: string[];
  isFirstPurchase?: boolean;
  description?: string;
}

export interface ValidatePromoCodeRequest {
  code: string;
  price: number;
  userId?: string;
}

export interface ValidatePromoCodeResponse {
  valid: boolean;
  error?: string;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
}

export interface ApplyPromoCodeRequest {
  code: string;
  price: number;
  userId: string;
  numberId: string;
}

export interface ApplyPromoCodeResponse {
  success: boolean;
  error?: string;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
  commissionAmount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isAdmin?: boolean;
}

// Represents the MongoDB user document structure
export interface MongoDBUser {
  _id: ObjectId;
  email: string;
  username: string;
  phone_number?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Represents a MongoDB query for MongoDBUser
export type MongoDBUserQuery = Partial<{
  _id: ObjectId | { $gt: ObjectId };
  username: RegExp;
  email: RegExp;
  $or: Array<{
    username?: RegExp;
    email?: RegExp;
    _id?: RegExp;
  }>;
}>;

export interface UserListResponse {
  users: User[];
  nextCursor?: string;
  hasNext: boolean;
}

// Offer types
export type OfferType = 'banner' | 'promo' | 'announcement';
export type Placement = 'home_top' | 'home_bottom' | 'calls_banner' | 'settings';

export interface Offer {
  _id?: ObjectId;
  id?: string;
  title: string;
  description?: string;
  type: OfferType;
  placement: Placement;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  discountCode?: string;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  title: string;
  description?: string;
  type: OfferType;
  placement: Placement;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  discountCode?: string;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}
