import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import ConversationModel from '@/models/Conversation';
import MessageModel from '@/models/Message';

export async function GET() {
  try {
    await connectMongoDB();

    // Fetch conversations, sorted by last message timestamp
    const conversations = await ConversationModel.find()
      .sort({ lastMessageTimestamp: -1 })
      .limit(50); // Limit to 50 most recent conversations

    // Also discover contacts from messages that don't have a conversation entry yet
    // This handles older messages stored before the Conversation model was fully used
    const existingPhones = new Set(conversations.map((c: any) => c.phoneNumber));
    
    const orphanedChats = await MessageModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$conversationId', '$contactPhoneNumber'] },
          lastMessage: { $last: '$content' },
          lastTimestamp: { $max: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      { $limit: 50 }
    ]);

    // Merge orphaned chats into conversations list
    const mergedConversations = [...conversations];
    for (const orphan of orphanedChats) {
      const phone = orphan._id;
      if (phone && !existingPhones.has(phone)) {
        mergedConversations.push({
          _id: phone,
          phoneNumber: phone,
          contactName: phone,
          lastMessage: orphan.lastMessage || '',
          lastMessageTimestamp: orphan.lastTimestamp,
          unreadCount: 0
        });
        existingPhones.add(phone);
      }
    }

    // Sort merged list by timestamp
    mergedConversations.sort((a: any, b: any) => {
      const tA = new Date(a.lastMessageTimestamp || 0).getTime();
      const tB = new Date(b.lastMessageTimestamp || 0).getTime();
      return tB - tA;
    });

    return NextResponse.json({ 
      success: true,
      conversations: mergedConversations.slice(0, 50)
    });
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}