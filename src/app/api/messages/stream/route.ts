//src\app\api\messages\stream\route.ts
import { NextResponse } from 'next/server';
import { Message } from '@/types';

// Simple in-memory event emitter for demonstration
const messageEmitters: Record<string, Set<(message: Message) => void>> = {};

// Internal function for broadcasting messages (not exported)
function broadcastMessageInternal(phoneNumber: string, message: Message) {
  const emitters = messageEmitters[phoneNumber];
  if (emitters) {
    emitters.forEach(emitter => emitter(message));
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get('phoneNumber');

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let messageListener: ((message: Message) => void) | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`: connected\n\n`));

      messageListener = (message: Message) => {
        try {
          const eventData = JSON.stringify(message);
          controller.enqueue(encoder.encode(`data: ${eventData}\n\n`));
        } catch {
          console.warn('Could not enqueue to closed SSE controller. Removing listener.');
          if (messageListener && messageEmitters[phoneNumber]) {
            messageEmitters[phoneNumber].delete(messageListener);
          }
        }
      };

      if (!messageEmitters[phoneNumber]) {
        messageEmitters[phoneNumber] = new Set();
      }
      messageEmitters[phoneNumber].add(messageListener);

      // Heartbeat every 30s to keep alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          if (messageListener && messageEmitters[phoneNumber]) {
            messageEmitters[phoneNumber].delete(messageListener);
          }
        }
      }, 30000);
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (messageListener && messageEmitters[phoneNumber]) {
        messageEmitters[phoneNumber].delete(messageListener);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Missing phone number or message' },
        { status: 400 }
      );
    }

    // Broadcast the message internally
    broadcastMessageInternal(phoneNumber, message);

    return NextResponse.json({ 
      success: true, 
      message: 'Message broadcasted' 
    });
  } catch (error) {
    console.error('Message Broadcast Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}