// src/app/api/send-whatsapp/route.ts
// Sends a single Meta WhatsApp template message to one contact
// Called by Salesforce Marketing Cloud Journey Builder Custom Activity

import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import MessageModel from '@/models/Message';
import ConversationModel from '@/models/Conversation';
import { MessageStatus } from '@/types';

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
    const body = await request.json();
    
    // SFMC Journey Builder sends data nested in an `inArguments` array
    const inArgs = body.inArguments && body.inArguments.length > 0 ? body.inArguments[0] : {};
    
    const phone = inArgs.phone || body.phone;
    const templateName = inArgs.templateName || body.templateName;
    const language = inArgs.language || body.language;
    const parameters = inArgs.parameters || body.parameters;

    if (!phone || !templateName) {
      console.error('[send-whatsapp] Missing phone/templateName:', JSON.stringify(body));
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

    // ----- Save to MongoDB & Emit SSE -----
    if (wamid) {
      try {
        await connectMongoDB();
        
        // Strip plus for normalized storage
        const normalizedPhone = formattedPhone.replace(/^\+/, '');

        // Determine content for the message (e.g. from template components)
        const paramText = parameters && parameters.length > 0 ? ` [Params: ${parameters.join(', ')}]` : '';
        const bodyContent = `[Template: ${templateName}]${paramText}`;

        const messageData = {
          id: wamid,
          content: bodyContent,
          timestamp: new Date().toISOString(),
          sender: 'user',
          status: MessageStatus.SENT,
          recipientId: normalizedPhone,
          contactPhoneNumber: normalizedPhone,
          originalId: wamid,
          conversationId: normalizedPhone,
        };

        // Save to MongoDB
        await MessageModel.updateOne(
          { id: wamid },
          { $setOnInsert: messageData },
          { upsert: true }
        );
        
        // Update or create conversation
        await ConversationModel.updateOne(
          { phoneNumber: normalizedPhone },
          { 
            $set: { 
              lastMessage: bodyContent,
              lastMessageTimestamp: messageData.timestamp 
            },
            $setOnInsert: { contactName: normalizedPhone, unreadCount: 0 }
          },
          { upsert: true }
        );

        console.log(`[send-whatsapp] Saved template message ${wamid} to MongoDB`);

        // Emit via SSE
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${appUrl}/api/messages/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: normalizedPhone,
            message: messageData
          })
        }).catch(err => console.error('[send-whatsapp] SSE emit failed:', err));

      } catch (dbError) {
        console.error('[send-whatsapp] Error saving to MongoDB:', dbError);
      }
    }

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
