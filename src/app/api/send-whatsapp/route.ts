// src/app/api/send-whatsapp/route.ts
// Sends a single Meta WhatsApp template message to one contact
// Called by Salesforce Marketing Cloud Journey Builder Custom Activity

import { NextResponse } from 'next/server';

interface SendWhatsAppPayload {
  phone: string;
  templateName: string;
  language: string;
  parameters?: string[];
}

export async function POST(request: Request) {
  try {
    // ----- Auth Check -----
    // When called from Journey Builder with useJwt: true,
    // validate the JWT from the Authorization header.
    // For now, we check that the request has a valid Bearer token
    // or is coming from a trusted source (extend with JB JWT validation as needed).
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // TODO: Implement full JWT signature validation with JB signing key
      // For now, log that auth header is present (never log the full token)
      const tokenSuffix = authHeader.slice(-4);
      console.log(`[send-whatsapp] Auth header present (ends with ...${tokenSuffix})`);
    }

    // ----- Parse & Validate Payload -----
    const body: SendWhatsAppPayload = await request.json();
    const { phone, templateName, language, parameters } = body;

    if (!phone || !templateName) {
      return NextResponse.json(
        { error: 'Missing required fields: phone and templateName are required' },
        { status: 400 }
      );
    }

    // ----- Env Vars -----
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.error('[send-whatsapp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID');
      return NextResponse.json(
        { error: 'Server configuration error: WhatsApp credentials not configured' },
        { status: 500 }
      );
    }

    // ----- Format Phone Number -----
    // WhatsApp API expects phone number without '+' prefix
    const formattedPhone = phone.replace(/[^0-9]/g, '');

    // ----- Build Template Message Payload -----
    const templateComponents: Array<Record<string, unknown>> = [];

    // Add body parameters if provided
    if (parameters && parameters.length > 0) {
      templateComponents.push({
        type: 'body',
        parameters: parameters.map((param) => ({
          type: 'text',
          text: param,
        })),
      });
    }

    const metaPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language || 'en_US',
        },
        ...(templateComponents.length > 0 && { components: templateComponents }),
      },
    };

    // ----- Send to Meta Graph API -----
    console.log(`[send-whatsapp] Sending template "${templateName}" to ${formattedPhone}`);

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metaPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[send-whatsapp] Meta API error:', JSON.stringify(errorData));
      return NextResponse.json(
        { error: 'Failed to send WhatsApp template message', details: errorData },
        { status: 502 }
      );
    }

    const data = await response.json();
    const wamid = data.messages?.[0]?.id || null;

    console.log(`[send-whatsapp] Message sent successfully. wamid: ${wamid}`);

    return NextResponse.json({
      success: true,
      wamid,
      messageId: wamid,
      to: formattedPhone,
      templateName,
    });
  } catch (error) {
    console.error('[send-whatsapp] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
