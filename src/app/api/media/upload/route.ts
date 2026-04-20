// src/app/api/media/upload/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    // Prefer server-side env (updated in real-time via /api/save-env)
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || formData.get('accessToken') as string;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || formData.get('phoneNumberId') as string;

    if (!file || !accessToken || !phoneNumberId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare FormData for Meta Graph API
    const metaFormData = new FormData();
    metaFormData.append('messaging_product', 'whatsapp');
    metaFormData.append('file', file);
    
    // Upload to Meta
    const metaUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/media`;
    
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: metaFormData
    });

    if (!metaResponse.ok) {
      const errorData = await metaResponse.json();
      console.error('[Media Upload] Meta API error:', JSON.stringify(errorData));
      return NextResponse.json({ error: 'Failed to upload media to Meta', details: errorData }, { status: metaResponse.status });
    }

    const data = await metaResponse.json();
    return NextResponse.json({ success: true, id: data.id });
    
  } catch (error) {
    console.error('[Media Upload] Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
