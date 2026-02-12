import { PromoCode } from '../types';
import PromoCodeModal from './components/PromoCodeModal';
import { getPromoCodes } from '../services/database';

export default async function Dashboard() {
  const promoCodes = await getPromoCodes();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900"></h1>
        <PromoCodeModal mode="create" />
      </div>

      <div className="border border-gray-100 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Promo Codes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Valid Until</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promoCode) => (
                <tr key={promoCode.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{promoCode.code}</td>
                  <td className="px-4 py-3">{promoCode.type}</td>
                  <td className="px-4 py-3">
                    {promoCode.discountType === 'percentage' ? `${promoCode.discountValue}%` : `$${promoCode.discountValue}`}
                    {promoCode.maxDiscount && ` (Max $${promoCode.maxDiscount})`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      promoCode.status === 'active' ? 'bg-green-100 text-green-800' :
                      promoCode.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {promoCode.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {promoCode.usageCount}/{promoCode.usageLimit || 'Unlimited'}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(promoCode.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <PromoCodeModal mode="edit" promoCode={promoCode} />
                      <button className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                      <button className="text-green-600 hover:text-green-800 text-xs font-medium">View Usage</button>
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
