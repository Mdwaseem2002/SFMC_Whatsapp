import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import UserProfile from '@/models/UserProfile';
import Workspace from '@/models/Workspace';
import WorkspaceContact from '@/models/WorkspaceContact';
import FastReply from '@/models/FastReply';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    const { userId } = session;

    // Fetch all user data in parallel
    const [profile, workspaces, contacts, fastReplies] = await Promise.all([
      UserProfile.findOne({ userId }).lean(),
      Workspace.find({ userId }).sort({ createdAt: 1 }).lean(),
      WorkspaceContact.find({ userId }).sort({ createdAt: -1 }).lean(),
      FastReply.find({ userId }).sort({ shortcut: 1 }).lean(),
    ]);

    // Format IDs for frontend
    const formatDocs = (docs: any[]) => docs.map(doc => ({ ...doc, id: doc._id.toString(), _id: undefined, __v: undefined }));

    return NextResponse.json({
      success: true,
      data: {
        profile: profile ? { ...profile, id: profile._id?.toString(), _id: undefined, __v: undefined } : null,
        workspaces: formatDocs(workspaces),
        contacts: formatDocs(contacts),
        fastReplies: formatDocs(fastReplies),
      }
    });

  } catch (error: any) {
    console.error('[User Sync] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
