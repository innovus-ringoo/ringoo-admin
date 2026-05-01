import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/app/lib/mongodb';

const INVOICES_COLLECTION = 'invoices';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const db = await getDatabase();

    const total = await db.collection(INVOICES_COLLECTION).countDocuments();
    const invoices = await db.collection(INVOICES_COLLECTION)
      .find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedInvoices = invoices.map(invoice => ({
      _id: invoice._id.toString(),
      userId: invoice.userId,
      userName: invoice.userName,
      userEmail: invoice.userEmail,
      invoiceId: invoice.invoiceId,
      date: invoice.date,
      billingPeriod: invoice.billingPeriod,
      transactionIds: invoice.transactionIds,
      items: invoice.items,
      categorizedItems: invoice.categorizedItems,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}