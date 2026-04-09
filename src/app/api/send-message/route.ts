//src\app\api\send-message\route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, message, accessToken, phoneNumberId } = await request.json();

    if (!to || !message || !accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Format the phone number to remove '+' if present, as WhatsApp API expects it without '+'
    const formattedPhone = to.replace('+', '');

    // Send message to WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
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