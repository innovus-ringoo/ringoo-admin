import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const users = await db.collection('users').find({}).limit(5).toArray();
    console.log('Users found:', users);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection test successful',
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.created_at
      }))
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
