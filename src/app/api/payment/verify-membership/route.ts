import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Public membership enrollment has been retired. Please register as an official volunteer at /volunteer.',
      redirectUrl: '/volunteer',
    },
    { status: 410 }
  );
}
