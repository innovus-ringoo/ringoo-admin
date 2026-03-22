'use server';

import { checkAdminRoleServer } from '../lib/auth-server';
import { getDatabase } from '../lib/mongodb';
import { sendPushNotification } from '../lib/fcm';
import { ObjectId } from 'mongodb';

export async function sendUserNotificationAction(
  userId: string,
  title: string,
  body: string
): Promise<{ success: boolean; sent?: number; failed?: number; error?: string }> {
  try {
    await checkAdminRoleServer();

    if (!userId || !title || !body) {
      return { success: false, error: 'userId, title and body are required' };
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { fcm_tokens: 1 } }
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const tokens: string[] = (user.fcm_tokens || [])
      .map((t: { token: string }) => t.token)
      .filter(Boolean);

    if (tokens.length === 0) {
      return { success: false, error: 'User has no FCM tokens registered' };
    }

    const result = await sendPushNotification(tokens, title, body);

    return { success: true, sent: result.success, failed: result.failure };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    };
  }
}
