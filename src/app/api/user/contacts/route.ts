import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import WorkspaceContact from '@/models/WorkspaceContact';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectMongoDB();

    const contact = await WorkspaceContact.create({
      userId: session.userId,
      workspaceId: body.workspaceId,
      name: body.name,
      phoneNumber: body.phoneNumber,
      company: body.company,
      email: body.email,
      tags: body.tags || [],
    });

    const doc = contact.toObject() as any;
    return NextResponse.json({ 
      success: true, 
      data: { ...doc, id: doc._id.toString(), _id: undefined, __v: undefined } 
    });
  } catch (error: any) {
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
    const result = await WorkspaceContact.findOneAndDelete({ _id: id, userId: session.userId });
    if (!result) return NextResponse.json({ error: 'Not found or permission denied' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await connectMongoDB();
    const updatedContact = await WorkspaceContact.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: updates },
      { new: true }
    );

    if (!updatedContact) return NextResponse.json({ error: 'Not found or permission denied' }, { status: 404 });

    const doc = updatedContact.toObject() as any;
    return NextResponse.json({ 
      success: true, 
      data: { ...doc, id: doc._id.toString(), _id: undefined, __v: undefined } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
