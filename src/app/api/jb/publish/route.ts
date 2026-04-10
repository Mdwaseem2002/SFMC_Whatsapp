import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[JB] Publish endpoint called');
  return NextResponse.json({ status: 'ok' });
}
