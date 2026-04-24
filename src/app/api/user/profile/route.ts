import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import UserProfile from '@/models/UserProfile';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectMongoDB();

    const [profile, user] = await Promise.all([
      UserProfile.findOne({ userId: session.userId }).lean(),
      User.findById(session.userId).lean(),
    ]);

    const data = profile
      ? { ...profile, id: (profile as any)._id?.toString(), _id: undefined, __v: undefined }
      : null;

    // Merge in user's auth email if profile doesn't have one
    if (data && !data.email && user) {
      data.email = (user as any).email || '';
    }
    // Merge in user's auth name if profile doesn't have one  
    if (data && !data.name && user) {
      data.name = (user as any).name || '';
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[User Profile GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectMongoDB();

    // Build update object — supports both onboarding fields and settings fields
    const updateFields: Record<string, any> = {};
    if (body.firstName !== undefined) updateFields.firstName = body.firstName;
    if (body.lastName !== undefined) updateFields.lastName = body.lastName;
    if (body.company !== undefined) updateFields.company = body.company;
    if (body.role !== undefined) updateFields.role = body.role;
    if (body.teamSize !== undefined) updateFields.teamSize = body.teamSize;
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.email !== undefined) updateFields.email = body.email;
    if (body.phone !== undefined) updateFields.phone = body.phone;

    const profile = await UserProfile.findOneAndUpdate(
      { userId: session.userId },
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    // Also update the User model name if provided
    if (body.name) {
      await User.findByIdAndUpdate(session.userId, { name: body.name });
    }

    const data = { ...profile, id: (profile as any)._id?.toString(), _id: undefined, __v: undefined };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[User Profile] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
