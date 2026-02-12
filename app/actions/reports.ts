'use server';

import { getReportsStatistics, getPromoCodeUsageTrend } from '../services/reports';
import { checkAdminRoleServer } from '../lib/auth-server';

export interface ReportsStatistics {
  totalPromoCodes: number;
  totalAgencies: number;
  totalDiscount: number;
  totalCommission: number;
  usageByType: Array<{
    _id: string;
    count: number;
    totalDiscount: number;
    totalCommission: number;
  }>;
  topAgencies: Array<{
    agencyId: string;
    agencyName: string;
    referralCount: number;
    totalDiscount: number;
    totalCommission: number;
  }>;
}

export interface UsageTrend {
  date: string;
  count: number;
  totalDiscount: number;
  totalCommission: number;
}

export async function getReportsStatisticsAction(): Promise<ReportsStatistics> {
  try {
    await checkAdminRoleServer();
    const data = await getReportsStatistics();
    return data as unknown as ReportsStatistics;
  } catch (error) {
    console.error('Failed to fetch reports statistics:', error);
    return {
      totalPromoCodes: 0,
      totalAgencies: 0,
      totalDiscount: 0,
      totalCommission: 0,
      usageByType: [],
      topAgencies: []
    };
  }
}

export async function getPromoCodeUsageTrendAction(): Promise<UsageTrend[]> {
  try {
    await checkAdminRoleServer();
    const data = await getPromoCodeUsageTrend();
    return data as unknown as UsageTrend[];
  } catch (error) {
    console.error('Failed to fetch promo code usage trend:', error);
    return [];
  }
}
