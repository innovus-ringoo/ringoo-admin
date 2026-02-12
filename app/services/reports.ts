import { getDatabase } from '../lib/mongodb';
import { PromoCode, Agency, PromoCodeUsage } from '../types';

// Collection names
const PROMO_CODES_COLLECTION = 'promo_codes';
const PROMO_CODE_USAGES_COLLECTION = 'promo_code_usages';
const AGENCIES_COLLECTION = 'agencies';

// Get reports statistics
export const getReportsStatistics = async () => {
  const db = await getDatabase();
  
  // Total promo codes
  const totalPromoCodes = await db.collection(PROMO_CODES_COLLECTION).countDocuments();
  
  // Total agencies
  const totalAgencies = await db.collection(AGENCIES_COLLECTION).countDocuments();
  
  // Total discounts and commissions
  const usages = await db.collection(PROMO_CODE_USAGES_COLLECTION).aggregate([
    {
      $group: {
        _id: null,
        totalDiscount: { $sum: '$discountAmount' },
        totalCommission: { $sum: '$commissionAmount' }
      }
    }
  ]).toArray();
  
  const { totalDiscount = 0, totalCommission = 0 } = usages[0] || {};
  
  // Promo code usage by type
  const usageByType = await db.collection(PROMO_CODE_USAGES_COLLECTION).aggregate([
    {
      $lookup: {
        from: PROMO_CODES_COLLECTION,
        localField: 'promoCodeId',
        foreignField: 'id',
        as: 'promoCode'
      }
    },
    {
      $unwind: '$promoCode'
    },
    {
      $group: {
        _id: '$promoCode.type',
        count: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        totalCommission: { $sum: '$commissionAmount' }
      }
    }
  ]).toArray();
  
  // Top agencies by referrals
  const topAgencies = await db.collection(PROMO_CODE_USAGES_COLLECTION).aggregate([
    {
      $lookup: {
        from: PROMO_CODES_COLLECTION,
        localField: 'promoCodeId',
        foreignField: 'id',
        as: 'promoCode'
      }
    },
    {
      $unwind: '$promoCode'
    },
    {
      $match: {
        'promoCode.type': 'agency'
      }
    },
    {
      $group: {
        _id: '$promoCode.agencyId',
        count: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        totalCommission: { $sum: '$commissionAmount' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: AGENCIES_COLLECTION,
        localField: '_id',
        foreignField: 'id',
        as: 'agency'
      }
    },
    {
      $unwind: '$agency'
    },
    {
      $project: {
        _id: 0,
        agencyId: '$_id',
        agencyName: '$agency.name',
        referralCount: '$count',
        totalDiscount: '$totalDiscount',
        totalCommission: '$totalCommission'
      }
    }
  ]).toArray();
  
  return {
    totalPromoCodes,
    totalAgencies,
    totalDiscount,
    totalCommission,
    usageByType,
    topAgencies
  };
};

// Get promo code usage trend (last 30 days)
export const getPromoCodeUsageTrend = async () => {
  const db = await getDatabase();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const trend = await db.collection(PROMO_CODE_USAGES_COLLECTION).aggregate([
    {
      $match: {
        usedAt: {
          $gte: thirtyDaysAgo.toISOString(),
          $lte: now.toISOString()
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$usedAt' } } },
        count: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        totalCommission: { $sum: '$commissionAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
        totalDiscount: 1,
        totalCommission: 1
      }
    }
  ]).toArray();
  
  return trend;
};
