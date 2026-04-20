import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import FastReply from '@/models/FastReply';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectMongoDB();

    const reply = await FastReply.create({
      userId: session.userId,
      title: body.title,
      body: body.body,
    });

    const doc = reply.toObject() as any;
    return NextResponse.json({ 
      success: true, 
      data: { ...doc, id: doc._id.toString(), _id: undefined, __v: undefined } 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Shortcut already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await connectMongoDB();
    const result = await FastReply.findOneAndDelete({ _id: id, userId: session.userId });
    if (!result) return NextResponse.json({ error: 'Not found or permission denied' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
