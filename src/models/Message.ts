// src/models/Message.ts
import mongoose from 'mongoose';
import { Message, MessageStatus } from '@/types';

const MessageSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true,
    index: true,
    unique: true 
  },
  content: { type: String, required: false, default: '' },
  timestamp: { type: Date, default: Date.now },
  sender: { type: String, enum: ['user', 'contact'], required: true },
  status: { 
    type: String, 
    enum: Object.values(MessageStatus), 
    default: MessageStatus.DELIVERED 
  },
  recipientId: { type: String, required: true },
  contactPhoneNumber: { type: String, required: true },
  conversationId: { type: String, required: true },
  originalId: { type: String },
  mediaType: { type: String, enum: ['image', 'video', 'document', 'audio', 'text', 'sticker'], default: 'text' },
  mediaId: { type: String },
  mimeType: { type: String },
  filename: { type: String },
  caption: { type: String },
  mediaData: { type: String } // base64-encoded binary, cached on arrival so media survives Meta expiry
}, {
  timestamps: true
});

// Remove any existing model to prevent recompilation warnings
if (mongoose.models.Message) {
  delete mongoose.models.Message;
}

// Create the model
const MessageModel = mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;