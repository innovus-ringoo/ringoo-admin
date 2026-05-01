import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/app/lib/mongodb';

const INVOICES_COLLECTION = 'invoices';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await params;
    const db = await getDatabase();

    const invoice = await db.collection(INVOICES_COLLECTION).findOne({
      invoiceId
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const formattedInvoice = {
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
    };

    return NextResponse.json(formattedInvoice);
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}