import { ObjectId } from 'mongodb';
import { getDatabase } from '../lib/mongodb';
import { Offer, CreateOfferRequest } from '../types';

const OFFERS_COLLECTION = 'offers';

export const getOffers = async (): Promise<Offer[]> => {
  const db = await getDatabase();
  const offers = await db
    .collection(OFFERS_COLLECTION)
    .find({})
    .sort({ priority: 1, createdAt: -1 })
    .toArray();

  return offers.map(offer => {
    const { _id, ...cleanOffer } = offer;
    return cleanOffer as Offer;
  });
};

export const getOfferById = async (id: string): Promise<Offer | null> => {
  const db = await getDatabase();
  const offer = await db
    .collection(OFFERS_COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!offer) return null;

  const { _id, ...cleanOffer } = offer;
  return cleanOffer as Offer;
};

export const createOffer = async (offerData: CreateOfferRequest): Promise<Offer> => {
  const db = await getDatabase();
  const now = new Date();
  const offerId = new ObjectId();

  const newOffer: Offer = {
    ...offerData,
    id: offerId.toString(),
    startDate: offerData.startDate ? new Date(`${offerData.startDate}T00:00:00Z`).toISOString() : undefined,
    endDate: offerData.endDate ? new Date(`${offerData.endDate}T00:00:00Z`).toISOString() : undefined,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await db
    .collection<Offer>(OFFERS_COLLECTION)
    .insertOne({
      ...newOffer,
      _id: offerId,
    });

  return newOffer;
};

export const updateOffer = async (id: string, updateData: Partial<CreateOfferRequest>): Promise<Offer | null> => {
  const db = await getDatabase();

  const processedData: Record<string, unknown> = { ...updateData };
  if (processedData.startDate && typeof processedData.startDate === 'string') {
    const dateStr = processedData.startDate as string;
    processedData.startDate = dateStr.length === 10
      ? new Date(`${dateStr}T00:00:00Z`).toISOString()
      : new Date(dateStr).toISOString();
  }
  if (processedData.endDate && typeof processedData.endDate === 'string') {
    const dateStr = processedData.endDate as string;
    processedData.endDate = dateStr.length === 10
      ? new Date(`${dateStr}T00:00:00Z`).toISOString()
      : new Date(dateStr).toISOString();
  }

  const result = await db
    .collection<Offer>(OFFERS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...processedData,
          updatedAt: new Date().toISOString(),
        },
      }
    );

  if (result.matchedCount === 0) return null;

  return await getOfferById(id);
};

export const deleteOffer = async (id: string): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db
    .collection<Offer>(OFFERS_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount > 0;
};
