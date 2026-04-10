import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[JB] Save endpoint called');
  return NextResponse.json({ status: 'ok' });
}
