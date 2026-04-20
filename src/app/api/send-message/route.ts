//src\app\api\send-message\route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, mediaId, mediaType, mimeType, filename } = body;

    // Always prefer server-side env (updated in real-time via /api/save-env)
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || body.accessToken;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || body.phoneNumberId;

    if (!to || (!message && !mediaId) || !accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Format the phone number to remove '+' if present, as WhatsApp API expects it without '+'
    const formattedPhone = to.replace('+', '');

    // Construct Meta payload
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
    };

    if (mediaId && mediaType) {
      payload.type = mediaType;
      payload[mediaType] = { id: mediaId };
      if (message) {
        payload[mediaType].caption = message;
      }
      if (filename && mediaType === 'document') {
        payload[mediaType].filename = filename;
      }
    } else {
      payload.type = 'text';
      payload.text = { preview_url: false, body: message || '' };
    }

    // Send message to WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );


    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send message', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}