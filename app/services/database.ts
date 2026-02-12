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
  
  // Convert MongoDB documents to plain objects for client component compatibility
  return promoCodes.map(promoCode => {
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
  
  const { _id, ...cleanPromoCode } = promoCode;
  return cleanPromoCode as PromoCode;
};

export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
  const db = await getDatabase();
  const promoCode = await db
    .collection(PROMO_CODES_COLLECTION)
    .findOne({ code: code.toUpperCase() });
  
  if (!promoCode) return null;
  
  const { _id, ...cleanPromoCode } = promoCode;
  return cleanPromoCode as PromoCode;
};

export const createPromoCode = async (promoCodeData: Omit<PromoCode, 'id' | 'usageCount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<PromoCode> => {
  const db = await getDatabase();
  const now = new Date();
  
  const newPromoCode: PromoCode = {
    ...promoCodeData,
    id: new ObjectId().toString(),
    usageCount: 0,
    status: 'active',
    validFrom: new Date(promoCodeData.validFrom).toISOString(),
    validUntil: new Date(promoCodeData.validUntil).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const result = await db
    .collection<PromoCode>(PROMO_CODES_COLLECTION)
    .insertOne({
      ...newPromoCode,
      _id: new ObjectId(newPromoCode.id),
    });

  // If this is an agency promo code, update the agency with this promo code information
  if (newPromoCode.type === 'agency' && newPromoCode.agencyId) {
    await updateAgency(newPromoCode.agencyId, {
      promoCode: newPromoCode.code,
      promoCodeId: result.insertedId.toString(),
    });
  }

  return { ...newPromoCode, id: result.insertedId.toString() };
};

export const updatePromoCode = async (id: string, updateData: Partial<PromoCode>): Promise<PromoCode | null> => {
  const db = await getDatabase();
  
  // Get current promo code before update
  const currentPromoCode = await getPromoCodeById(id);
  
  const result = await db
    .collection<PromoCode>(PROMO_CODES_COLLECTION)
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
  
  const updatedPromoCode = await getPromoCodeById(id);
  
  // If this is an agency promo code, update the agency with this promo code information
  if (updatedPromoCode?.type === 'agency' && updatedPromoCode.agencyId) {
    await updateAgency(updatedPromoCode.agencyId, {
      promoCode: updatedPromoCode.code,
      promoCodeId: updatedPromoCode.id,
    });
  }
  
  // If we changed the type from agency to something else, remove the promo code from the agency
  if (currentPromoCode?.type === 'agency' && currentPromoCode.agencyId && updatedPromoCode?.type !== 'agency') {
    await updateAgency(currentPromoCode.agencyId, {
      promoCode: '',
      promoCodeId: '',
    });
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
    .collection<PromoCodeUsage>(PROMO_CODE_USAGES_COLLECTION)
    .find({ promoCodeId })
    .sort({ usedAt: -1 })
    .toArray();
  
  return usages;
};

export const createPromoCodeUsage = async (usageData: Omit<PromoCodeUsage, 'id' | 'usedAt'>): Promise<PromoCodeUsage> => {
  const db = await getDatabase();
  const now = new Date();
  
  const newUsage: PromoCodeUsage = {
    ...usageData,
    id: new ObjectId().toString(),
    usedAt: now.toISOString(),
  };

  const result = await db
    .collection<PromoCodeUsage>(PROMO_CODE_USAGES_COLLECTION)
    .insertOne({
      ...newUsage,
      _id: new ObjectId(newUsage.id),
    });

  return { ...newUsage, id: result.insertedId.toString() };
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
  await updateAgency(newAgency.id, {
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