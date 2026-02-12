import { ObjectId } from 'mongodb';
import { getDatabase } from '../lib/mongodb';
import {
  Agency,
  AgencyCommission,
  PromoCode,
  PromoCodeUsage
} from '../types';

// Collection names
const PROMO_CODES_COLLECTION = 'promo_codes';
const PROMO_CODE_USAGES_COLLECTION = 'promo_code_usages';
const AGENCIES_COLLECTION = 'agencies';
const AGENCY_COMMISSIONS_COLLECTION = 'agency_commissions';

// Promo Code Operations
export const getPromoCodes = async (): Promise<PromoCode[]> => {
  const db = await getDatabase();
  const promoCodes = await db
    .collection(PROMO_CODES_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  
  // Calculate actual usage count from promo_code_usages collection
  const promoCodesWithRealUsage = await Promise.all(
    promoCodes.map(async (promoCode) => {
      const usageCount = await db
        .collection(PROMO_CODE_USAGES_COLLECTION)
        .countDocuments({ promo_code_id: new ObjectId(promoCode.id) });
      
      return {
        ...promoCode,
        usageCount,
      };
    })
  );
  
  // Convert MongoDB documents to plain objects for client component compatibility
  return promoCodesWithRealUsage.map(promoCode => {
    const { _id, ...cleanPromoCode } = promoCode;
    return cleanPromoCode as PromoCode;
  });
};

export const getPromoCodeById = async (id: string): Promise<PromoCode | null> => {
  const db = await getDatabase();
  const promoCode = await db
    .collection(PROMO_CODES_COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  
  if (!promoCode) return null;
  
  // Calculate actual usage count from promo_code_usages collection
  const usageCount = await db
    .collection(PROMO_CODE_USAGES_COLLECTION)
    .countDocuments({ promo_code_id: new ObjectId(promoCode.id) });
  
  const { _id, ...cleanPromoCode } = promoCode;
  return { ...cleanPromoCode, usageCount } as PromoCode;
};

export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
  const db = await getDatabase();
  const promoCode = await db
    .collection(PROMO_CODES_COLLECTION)
    .findOne({ code: code.toUpperCase() });
  
  if (!promoCode) return null;
  
  // Calculate actual usage count from promo_code_usages collection
  const usageCount = await db
    .collection(PROMO_CODE_USAGES_COLLECTION)
    .countDocuments({ promo_code_id: new ObjectId(promoCode.id) });
  
  const { _id, ...cleanPromoCode } = promoCode;
  return { ...cleanPromoCode, usageCount } as PromoCode;
};

export const createPromoCode = async (promoCodeData: Omit<PromoCode, 'id' | 'usageCount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<PromoCode> => {
  const db = await getDatabase();
  const now = new Date();
  
  // Ensure dates are properly parsed as UTC
  const parseDateToUTC = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString();
    
    // If date string is in YYYY-MM-DD format, add time to make it UTC
    if (dateStr.length === 10) {
      return new Date(`${dateStr}T00:00:00Z`).toISOString();
    }
    
    // Otherwise, parse as is but ensure UTC
    const date = new Date(dateStr);
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )).toISOString();
  };
  
  const promoCodeId = new ObjectId();
  const newPromoCode: PromoCode = {
    ...promoCodeData,
    id: promoCodeId.toString(),
    usageCount: 0,
    status: 'active',
    validFrom: parseDateToUTC(promoCodeData.validFrom),
    validUntil: parseDateToUTC(promoCodeData.validUntil),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const result = await db
    .collection<PromoCode>(PROMO_CODES_COLLECTION)
    .insertOne({
      ...newPromoCode,
      _id: promoCodeId,
    });

  // If this is an agency promo code, update the agency with this promo code information
  if (newPromoCode.type === 'agency' && newPromoCode.agencyId) {
    await updateAgency(
      newPromoCode.agencyId instanceof ObjectId 
        ? newPromoCode.agencyId.toString() 
        : newPromoCode.agencyId,
      {
        promoCode: newPromoCode.code,
        promoCodeId: promoCodeId.toString(),
      }
    );
  }

  return newPromoCode;
};

export const updatePromoCode = async (id: string, updateData: Partial<PromoCode>): Promise<PromoCode | null> => {
  const db = await getDatabase();
  
  // Get current promo code before update
  const currentPromoCode = await getPromoCodeById(id);
  
  // Ensure dates are properly parsed as UTC when updating
  const processedUpdateData = { ...updateData };
  if (processedUpdateData.validFrom) {
    const date = new Date(processedUpdateData.validFrom);
    processedUpdateData.validFrom = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )).toISOString();
  }
  if (processedUpdateData.validUntil) {
    const date = new Date(processedUpdateData.validUntil);
    processedUpdateData.validUntil = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )).toISOString();
  }
  
  const result = await db
    .collection<PromoCode>(PROMO_CODES_COLLECTION)
    .updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...processedUpdateData, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );

  if (result.matchedCount === 0) return null;
  
  const updatedPromoCode = await getPromoCodeById(id);
  
  // If this is an agency promo code, update the agency with this promo code information
  if (updatedPromoCode?.type === 'agency' && updatedPromoCode.agencyId) {
    await updateAgency(
      updatedPromoCode.agencyId instanceof ObjectId 
        ? updatedPromoCode.agencyId.toString() 
        : updatedPromoCode.agencyId,
      {
        promoCode: updatedPromoCode.code,
        promoCodeId: updatedPromoCode.id,
      }
    );
  }
  
  // If we changed the type from agency to something else, remove the promo code from the agency
  if (currentPromoCode?.type === 'agency' && currentPromoCode.agencyId && updatedPromoCode?.type !== 'agency') {
    await updateAgency(
      currentPromoCode.agencyId instanceof ObjectId 
        ? currentPromoCode.agencyId.toString() 
        : currentPromoCode.agencyId,
      {
        promoCode: '',
        promoCodeId: '',
      }
    );
  }
  
  return updatedPromoCode;
};

export const deletePromoCode = async (id: string): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db
    .collection<PromoCode>(PROMO_CODES_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount > 0;
};

export const getPromoCodeUsages = async (promoCodeId: string): Promise<PromoCodeUsage[]> => {
  const db = await getDatabase();
  const usages = await db
    .collection(PROMO_CODE_USAGES_COLLECTION)
    .find({ promo_code_id: new ObjectId(promoCodeId) })
    .sort({ used_at: -1 })
    .toArray();
  
  // Convert database fields to TypeScript interface fields
  return usages.map(usage => ({
    id: (usage as any)._id.toString(),
    promoCodeId: (usage as any).promo_code_id.toString(),
    userId: (usage as any).user_id.toString(),
    numberId: (usage as any).number_id.toString(),
    discountAmount: (usage as any).discount_amount,
    originalPrice: (usage as any).original_price,
    finalPrice: (usage as any).final_price,
    usedAt: (usage as any).used_at.toISOString(),
  }));
};

export const createPromoCodeUsage = async (usageData: Omit<PromoCodeUsage, 'id' | 'usedAt'>): Promise<PromoCodeUsage> => {
  const db = await getDatabase();
  const now = new Date();
  
  const newUsage = {
    promo_code_id: new ObjectId(usageData.promoCodeId),
    user_id: new ObjectId(usageData.userId),
    number_id: new ObjectId(usageData.numberId),
    discount_amount: usageData.discountAmount,
    original_price: usageData.originalPrice,
    final_price: usageData.finalPrice,
    commission_amount: usageData.commissionAmount,
    used_at: now,
  };

  const result = await db
    .collection(PROMO_CODE_USAGES_COLLECTION)
    .insertOne(newUsage);

  return {
    id: result.insertedId.toString(),
    promoCodeId: newUsage.promo_code_id.toString(),
    userId: newUsage.user_id.toString(),
    numberId: newUsage.number_id.toString(),
    discountAmount: newUsage.discount_amount,
    originalPrice: newUsage.original_price,
    finalPrice: newUsage.final_price,
    commissionAmount: newUsage.commission_amount,
    usedAt: newUsage.used_at.toISOString(),
  };
};

// Agency Operations
export const getAgencies = async (): Promise<Agency[]> => {
  const db = await getDatabase();
  const agencies = await db
    .collection(AGENCIES_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  
  // Convert MongoDB documents to plain objects for client component compatibility
  return agencies.map(agency => {
    const { _id, ...cleanAgency } = agency;
    return cleanAgency as Agency;
  });
};

export const getAgencyById = async (id: string): Promise<Agency | null> => {
  const db = await getDatabase();
  const agency = await db
    .collection(AGENCIES_COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  
  if (!agency) return null;
  
  // Convert MongoDB document to plain object for client component compatibility
  const { _id, ...cleanAgency } = agency;
  return cleanAgency as Agency;
};

export const createAgency = async (agencyData: Omit<Agency, 'id' | 'promoCode' | 'promoCodeId' | 'totalReferrals' | 'totalEarnings' | 'pendingPayout' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Agency> => {
  const db = await getDatabase();
  const now = new Date();
  
  // Generate unique promo code for the agency
  const promoCode = `AGENCY${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  
  const newAgency: Agency = {
    ...agencyData,
    id: new ObjectId().toString(),
    promoCode,
    promoCodeId: '', // will be set when promo code is created
    totalReferrals: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    status: 'active',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const result = await db
    .collection<Agency>(AGENCIES_COLLECTION)
    .insertOne({
      ...newAgency,
      _id: new ObjectId(newAgency.id),
    });

  // Create corresponding promo code entry in promo_codes collection
  const agencyPromoCode = await createPromoCode({
    code: promoCode,
    type: 'agency',
    discountType: 'percentage',
    discountValue: 10, // Default 10% discount for agency referral codes
    commissionRate: agencyData.commissionRate,
    agencyId: newAgency.id,
    agencyName: agencyData.name,
    validFrom: now.toISOString(),
    validUntil: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year validity
    description: `Agency referral code for ${agencyData.name}`,
  });

  // Update agency with promo code ID
  await updateAgency(newAgency.id!, {
    promoCodeId: agencyPromoCode.id,
  });

  return { ...newAgency, id: result.insertedId.toString(), promoCodeId: agencyPromoCode.id };
};

export const updateAgency = async (id: string, updateData: Partial<Agency>): Promise<Agency | null> => {
  const db = await getDatabase();
  const result = await db
    .collection<Agency>(AGENCIES_COLLECTION)
    .updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );

  if (result.matchedCount === 0) return null;
  
  return await getAgencyById(id);
};

export const getAgencyDashboard = async (agencyId: string): Promise<Agency & { commissions: AgencyCommission[] } | null> => {
  const db = await getDatabase();
  const agency = await db
    .collection(AGENCIES_COLLECTION)
    .findOne({ _id: new ObjectId(agencyId) });
  
  if (!agency) return null;

  const commissions = await db
    .collection(AGENCY_COMMISSIONS_COLLECTION)
    .find({ agencyId })
    .sort({ lastUpdatedAt: -1 })
    .toArray();

  // Convert MongoDB document to plain object for client component compatibility
  const { _id, ...cleanAgency } = agency;
  return {
    ...cleanAgency as Agency,
    commissions: commissions.map(commission => {
      const { _id, ...cleanCommission } = commission;
      return cleanCommission as AgencyCommission;
    }),
  };
};