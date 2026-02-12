import { NextRequest, NextResponse } from 'next/server';
import { getAgencies, createAgency, updateAgency, getAgencyById, getAgencyDashboard } from '../../../services/database';
import { CreateAgencyRequest } from '../../../types';
import { checkAdminRole } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const agencies = await getAgencies();
    return NextResponse.json(agencies);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const agencyData: CreateAgencyRequest = await request.json();
    const newAgency = await createAgency(agencyData);
    return NextResponse.json(newAgency, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create agency' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const updatedAgency = await updateAgency(id, updateData);
    if (!updatedAgency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAgency);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update agency' },
      { status: 500 }
    );
  }
}