import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '../../../lib/auth';
import { uploadToS3 } from '../../../lib/s3';

export async function POST(request: NextRequest) {
  const checkResult = await checkAdminRole(request);
  if (!checkResult.authorized) {
    return NextResponse.json({ error: checkResult.error }, { status: checkResult.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'png';
    const key = `offers/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const url = await uploadToS3(buffer, key, file.type);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
