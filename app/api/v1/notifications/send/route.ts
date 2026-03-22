import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { sendPushNotification } from '../../../../lib/fcm';
import { checkAdminRole } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminRole(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { userId, title, body } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'userId, title and body are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { fcm_tokens: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tokens: string[] = (user.fcm_tokens || []).map(
      (t: { token: string }) => t.token
    ).filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'User has no FCM tokens registered' }, { status: 400 });
    }

    const result = await sendPushNotification(tokens, title, body);

    return NextResponse.json({
      success: true,
      sent: result.success,
      failed: result.failure,
      total: tokens.length,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    );
  }
}
