import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/app/lib/mongodb';

const INVOICES_COLLECTION = 'invoices';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['Paid', 'Pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Paid or Pending' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const result = await db.collection(INVOICES_COLLECTION).updateOne(
      { invoiceId },
      {
        $set: {
          status,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update invoice status:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}