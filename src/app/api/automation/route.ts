import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import AutomationJourney from '@/models/AutomationJourney';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectMongoDB();
    const journeys = await AutomationJourney.find({ userId: session.userId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: journeys.map((doc: any) => ({
        id: doc._id.toString(),
        userId: doc.userId,
        workspaceId: doc.workspaceId,
        name: doc.name,
        status: doc.status,
        nodes: doc.nodes,
        edges: doc.edges,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectMongoDB();

    const journey = await AutomationJourney.create({
      userId: session.userId,
      workspaceId: body.workspaceId || '',
      name: body.name || 'New Journey',
      status: body.status || 'draft',
      nodes: body.nodes || [],
      edges: body.edges || [],
    });

    const doc = journey.toObject() as any;
    return NextResponse.json({
      success: true,
      data: {
        id: doc._id.toString(),
        userId: doc.userId,
        workspaceId: doc.workspaceId,
        name: doc.name,
        status: doc.status,
        nodes: doc.nodes,
        edges: doc.edges,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
