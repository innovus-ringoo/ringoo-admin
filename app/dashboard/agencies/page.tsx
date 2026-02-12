
import AgencyModal from './components/AgencyModal';
import { getAgencies } from '../../services/database';

export default async function AgenciesPage() {
  const agencies = await getAgencies();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900"></h1>
        <AgencyModal mode="create" />
      </div>

      <div className="border border-gray-100 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Agencies</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Promo Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Commission Rate</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Referrals</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Earnings</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pending Payout</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{agency.name}</td>
                  <td className="px-4 py-3">{agency.email}</td>
                  <td className="px-4 py-3 font-medium">{agency.promoCode}</td>
                  <td className="px-4 py-3">{agency.commissionRate}%</td>
                  <td className="px-4 py-3">{agency.totalReferrals}</td>
                  <td className="px-4 py-3">${agency.totalEarnings.toFixed(2)}</td>
                  <td className="px-4 py-3">${agency.pendingPayout.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      agency.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <AgencyModal mode="edit" agency={agency} />
                      <button className="text-green-600 hover:text-green-800 text-xs font-medium">View Dashboard</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
