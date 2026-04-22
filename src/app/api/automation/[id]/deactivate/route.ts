import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import AutomationJourney from '@/models/AutomationJourney';
import AutomationExecution from '@/models/AutomationExecution';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectMongoDB();

    await AutomationJourney.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: { status: 'draft' } }
    );

    // Cancel all pending executions
    await AutomationExecution.updateMany(
      { journeyId: id, status: 'pending' },
      { $set: { status: 'failed' } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
