import { getOffers } from '../../services/offers';
import OfferModal from './components/OfferModal';
import DeleteOfferButton from './components/DeleteOfferButton';

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900"></h1>
        <OfferModal mode="create" />
      </div>

      <div className="border border-gray-100 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Offers</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Image</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Placement</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dates</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {offer.imageUrl ? (
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="h-10 w-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{offer.title}</td>
                  <td className="px-4 py-3">{offer.type}</td>
                  <td className="px-4 py-3">{offer.placement.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{offer.priority}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {offer.startDate && (
                      <div>From: {new Date(offer.startDate).toLocaleDateString()}</div>
                    )}
                    {offer.endDate && (
                      <div>To: {new Date(offer.endDate).toLocaleDateString()}</div>
                    )}
                    {!offer.startDate && !offer.endDate && (
                      <span className="text-gray-400">No dates</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <OfferModal mode="edit" offer={offer} />
                      <DeleteOfferButton offerId={offer.id!} />
                    </div>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No offers yet. Create your first offer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
