import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import UserProfile from '@/models/UserProfile';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectMongoDB();

    // Upsert the profile
    const profile = await UserProfile.findOneAndUpdate(
      { userId: session.userId },
      { $set: { 
          firstName: body.firstName, 
          lastName: body.lastName, 
          company: body.company, 
          role: body.role, 
          teamSize: body.teamSize 
      } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ 
      success: true, 
      data: { ...profile, id: profile._id?.toString(), _id: undefined, __v: undefined } 
    });
  } catch (error: any) {
    console.error('[User Profile] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
