import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access token is required' }, { status: 400 });
    }

    // 1. Update active memory so Next.js apps start using it right now without a server restart
    process.env.WHATSAPP_ACCESS_TOKEN = accessToken;

    // 2. Safely read and update .env.local file so the changes persist after reboot
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // If the token is already in the file, replace it. Otherwise, append it.
    if (envContent.includes('WHATSAPP_ACCESS_TOKEN=')) {
      envContent = envContent.replace(
        /WHATSAPP_ACCESS_TOKEN=.*/g,
        `WHATSAPP_ACCESS_TOKEN="${accessToken}"`
      );
    } else {
      envContent += `\nWHATSAPP_ACCESS_TOKEN="${accessToken}"\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    
    // Quick log to backend terminal so user sees it successfully updated
    console.log('[API] Dynamically swapped WHATSAPP_ACCESS_TOKEN in .env.local');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving env vars:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
