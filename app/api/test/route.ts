import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    console.log('Database connected successfully');
    
    // Check if users collection exists and has documents
    const usersCollection = db.collection('users');
    const usersCount = await usersCollection.countDocuments();
    const sampleUser = await usersCollection.findOne({});
    
    console.log(`Users count: ${usersCount}`);
    console.log('Sample user:', sampleUser);
    
    return NextResponse.json({
      success: true,
      usersCount,
      sampleUser,
      message: 'MongoDB connection test successful'
    });
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
