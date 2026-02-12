import { NextRequest, NextResponse } from 'next/server';
import { getAgencyDashboard } from '../../../../../services/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dashboardData = await getAgencyDashboard(id);
    
    if (!dashboardData) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agency dashboard' },
      { status: 500 }
    );
  }
}