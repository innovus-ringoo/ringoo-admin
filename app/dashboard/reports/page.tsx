'use client';

import { useState, useEffect } from 'react';
import { 
  getReportsStatisticsAction, 
  getPromoCodeUsageTrendAction,
  ReportsStatistics,
  UsageTrend
} from '../../actions/reports';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function ReportsPage() {
  const [statistics, setStatistics] = useState<ReportsStatistics | null>(null);
  const [usageTrend, setUsageTrend] = useState<UsageTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, trend] = await Promise.all([
          getReportsStatisticsAction(),
          getPromoCodeUsageTrendAction()
        ]);
        setStatistics(stats);
        setUsageTrend(trend);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading reports data...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <button className="bg-[#2A93FF] hover:bg-[#1e77d3] text-white px-4 py-2 rounded transition-colors">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Promo Codes</p>
              <p className="text-2xl font-bold text-gray-800">{statistics?.totalPromoCodes}</p>
            </div>
            <div className="bg-[#2A93FF]/10 rounded-full p-3">
              <svg className="w-6 h-6 text-[#2A93FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+2 this week</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Agencies</p>
              <p className="text-2xl font-bold text-gray-800">{statistics?.totalAgencies}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+1 this month</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Discounts</p>
              <p className="text-2xl font-bold text-gray-800">${statistics?.totalDiscount.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-800">${statistics?.totalCommission.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">+8% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-lg">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Promo Code Usage Trend</h2>
          </div>
          <div className="h-64 bg-gray-50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usageTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Usage Count" 
                  stroke="#2A93FF" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalDiscount" 
                  name="Total Discount" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalCommission" 
                  name="Total Commission" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Top Agencies by Referrals</h2>
          </div>
          <div className="h-64 bg-gray-50">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics?.topAgencies}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="agencyName" 
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar 
                  dataKey="referralCount" 
                  name="Referral Count" 
                  fill="#2A93FF" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="totalCommission" 
                  name="Total Commission" 
                  fill="#8B5CF6" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Usage Breakdown Table */}
      <div className="mt-8 border border-gray-100 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Usage Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Promo Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usage Count</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Discount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Commission</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.usageByType.map((usage) => (
                <tr key={usage._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{usage._id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      usage._id === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {usage._id}
                    </span>
                  </td>
                  <td className="px-4 py-3">{usage.count}</td>
                  <td className="px-4 py-3">${usage.totalDiscount.toFixed(2)}</td>
                  <td className="px-4 py-3">${usage.totalCommission.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Agencies Table */}
      <div className="mt-8 border border-gray-100 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Top Agencies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Agency</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Referral Count</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Discount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Commission</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.topAgencies.map((agency) => (
                <tr key={agency.agencyId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{agency.agencyName}</td>
                  <td className="px-4 py-3">{agency.referralCount}</td>
                  <td className="px-4 py-3">${agency.totalDiscount.toFixed(2)}</td>
                  <td className="px-4 py-3">${agency.totalCommission.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
