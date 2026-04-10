// src/app/api/webhook/route.ts
// Handles Meta WhatsApp webhook:
// - GET: Verification handshake
// - POST: Incoming messages + delivery status receipts (→ SFMC Data Extension)

import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSfmcAccessToken } from '@/lib/sfmcAuth';
import MessageModel from '@/models/Message';
import { MessageStatus } from '@/types';

// ----- Idempotency: Track processed wamids in-memory -----
const processedWamids = new Set<string>();
const MAX_PROCESSED_WAMIDS = 10000;

function markWamidProcessed(wamid: string): boolean {
  if (processedWamids.has(wamid)) {
    return false; // Already processed
  }
  // LRU-style eviction: if at capacity, clear oldest entries
  if (processedWamids.size >= MAX_PROCESSED_WAMIDS) {
    const iterator = processedWamids.values();
    // Delete first 1000 entries (oldest)
    for (let i = 0; i < 1000; i++) {
      const oldest = iterator.next().value;
      if (oldest) processedWamids.delete(oldest);
    }
  }
  processedWamids.add(wamid);
  return true; // Newly processed
}

// Enable CORS and handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Support both env var names for backwards compatibility
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } else {
    return new NextResponse("Forbidden", { 
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function POST(request: Request) {
  // ----- Acknowledge Meta IMMEDIATELY with 200 -----
  // We parse the body first since we can only read it once,
  // but we structure the code to respond quickly.
  
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawBody);
  } catch {
    console.error("[webhook] Failed to parse webhook payload");
    return new NextResponse("Invalid JSON payload", { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Not a WhatsApp event — acknowledge and return
  if (!data || data.object !== "whatsapp_business_account") {
    return new NextResponse("Not a WhatsApp event", { 
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // ----- Process in background after acknowledging -----
  // Using waitUntil pattern: we return 200 immediately and process async
  // In Next.js App Router, we process synchronously but respond 200 regardless

  try {
    // Ensure MongoDB connection for incoming messages
    await connectMongoDB();

    const entries = (data.entry as Array<Record<string, unknown>>) || [];

    for (const entry of entries) {
      const changes = (entry.changes as Array<Record<string, unknown>>) || [];

      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = (change.value as Record<string, unknown>) || {};

        // ----- Handle Incoming Messages (existing logic) -----
        const messages = value.messages as Array<Record<string, unknown>> | undefined;
        if (messages && Array.isArray(messages)) {
          for (const message of messages) {
            console.log("[webhook] Processing Message:", JSON.stringify(message, null, 2));

            if (message.type === "text" && message.text) {
              try {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const textObj = message.text as Record<string, string>;
                
                const storeResponse = await fetch(
                  `${appUrl}/api/messages`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      phoneNumber: message.from,
                      message: {
                        ...message,
                        text: { body: textObj.body },
                        from: 'contact',
                        content: textObj.body,
                      },
                    }),
                  }
                );

                const storeResult = await storeResponse.json();
                console.log("[webhook] Message Storage Result:", storeResult);

                // --- Emit SSE for real-time frontend update ---
                if (storeResult.success) {
                  const normalizedPhone = (message.from as string).replace(/^\+/, '');
                  await fetch(`${appUrl}/api/messages/stream`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      phoneNumber: normalizedPhone,
                      message: storeResult.message
                    })
                  }).catch(err => console.error('[webhook] SSE emit failed:', err));
                }
              } catch (storeError) {
                console.error("[webhook] Error storing message:", storeError);
              }
            }
          }
        }

        // ----- Handle Delivery Status Updates (NEW — SFMC integration) -----
        const statuses = value.statuses as Array<Record<string, unknown>> | undefined;
        if (statuses && Array.isArray(statuses)) {
          for (const status of statuses) {
            const wamid = status.id as string;
            const statusValue = status.status as string; // sent, delivered, read, failed
            const recipientId = status.recipient_id as string;
            const timestamp = status.timestamp as string;

            if (!wamid) continue;

            const errors = status.errors ? JSON.stringify(status.errors) : '';
            console.log(`[webhook] Status update: wamid=${wamid}, status=${statusValue}, recipient=${recipientId} ${errors ? `| errors=${errors}` : ''}`);

            // ----- Idempotency Check -----
            // Build a composite key: wamid + status (same wamid can have multiple statuses: sent → delivered → read)
            const idempotencyKey = `${wamid}:${statusValue}`;
            if (!markWamidProcessed(idempotencyKey)) {
              console.log(`[webhook] Skipping duplicate status: ${idempotencyKey}`);
              continue;
            }

            // ----- Write to SFMC Data Extension -----
            try {
              await writeSfmcDeliveryStatus({
                wamid,
                status: statusValue,
                recipientId,
                timestamp,
              });
            } catch (sfmcError) {
              console.error(`[webhook] SFMC write failed for ${wamid}:`, sfmcError);
              // Don't throw — we already acknowledged Meta
            }

            // ----- Update Message Status in MongoDB -----
            try {
              let mappedStatus = MessageStatus.FAILED;
              if (statusValue === 'sent') mappedStatus = MessageStatus.SENT;
              if (statusValue === 'delivered') mappedStatus = MessageStatus.DELIVERED;
              if (statusValue === 'read') mappedStatus = MessageStatus.READ;

              // Use original recipientId, or contactPhoneNumber if that's what was used
              // Let's find the message first
              const updatedMessage = await MessageModel.findOneAndUpdate(
                { id: wamid },
                { status: mappedStatus },
                { new: true }
              );

              if (updatedMessage) {
                console.log(`[webhook] DB Update: Message ${wamid} status changed to ${mappedStatus}`);
                
                // ----- Push to SSE Stream -----
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                
                // Format the object properly for the broadasting API
                const sseMessage = {
                  id: updatedMessage.id,
                  content: updatedMessage.content,
                  timestamp: updatedMessage.timestamp,
                  sender: updatedMessage.sender,
                  status: updatedMessage.status,
                  recipientId: updatedMessage.recipientId,
                  contactPhoneNumber: updatedMessage.contactPhoneNumber
                };

                const sseResponse = await fetch(`${appUrl}/api/messages/stream`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phoneNumber: updatedMessage.contactPhoneNumber || updatedMessage.recipientId,
                    message: sseMessage
                  })
                });
                
                if (!sseResponse.ok) {
                   console.error(`[webhook] Failed to broadcast status update via SSE for wamid=${wamid}`);
                }
              } else {
                 console.log(`[webhook] Message with wamid=${wamid} not found in DB to update status.`);
              }
            } catch (dbError) {
              console.error(`[webhook] DB update failed for ${wamid}:`, dbError);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[webhook] Processing error:", error);
    // Still return 200 — Meta has already been acknowledged
  }

  return new NextResponse("EVENT_RECEIVED", {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ----- SFMC Data Extension Writer -----

interface DeliveryStatusPayload {
  wamid: string;
  status: string;
  recipientId: string;
  timestamp: string;
}

async function writeSfmcDeliveryStatus(payload: DeliveryStatusPayload): Promise<void> {
  const sfmcRestBaseUri = process.env.SFMC_REST_BASE_URI;

  if (!sfmcRestBaseUri) {
    console.warn('[webhook] SFMC_REST_BASE_URI not configured — skipping SFMC write');
    return;
  }

  // Get cached SFMC access token
  const { access_token } = await getSfmcAccessToken();

  // Convert Unix timestamp to ISO string
  const isoTimestamp = payload.timestamp 
    ? new Date(Number(payload.timestamp) * 1000).toISOString()
    : new Date().toISOString();

  // Map status to the correct timestamp column
  const timestampFields: Record<string, string> = {};
  switch (payload.status) {
    case 'sent':
      timestampFields.SentTime = isoTimestamp;
      break;
    case 'delivered':
      timestampFields.DeliveredTime = isoTimestamp;
      break;
    case 'read':
      timestampFields.ReadTime = isoTimestamp;
      break;
    // 'failed' status doesn't have a specific timestamp column
  }

  // Build SFMC Data Extension row payload
  const sfmcPayload = [
    {
      keys: {
        // According to the DE definition, ContactKey is the primary key
        ContactKey: payload.recipientId,
      },
      values: {
        Phone: payload.recipientId,
        WaMid: payload.wamid,
        Status: payload.status,
        ...timestampFields,
      },
    },
  ];

  console.log(`[webhook] Writing to SFMC DE: wamid=${payload.wamid}, status=${payload.status}`);

  const sfmcResponse = await fetch(
    `${sfmcRestBaseUri}/data/v1/async/dataextensions/key:WhatsApp_Message_Log/rows`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: sfmcPayload }),
    }
  );

  if (!sfmcResponse.ok) {
    const errorText = await sfmcResponse.text();
    throw new Error(`SFMC API error (${sfmcResponse.status}): ${errorText}`);
  }

  console.log(`[webhook] SFMC write successful for wamid=${payload.wamid}`);
}