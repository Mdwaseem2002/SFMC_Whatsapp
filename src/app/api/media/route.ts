import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaId = searchParams.get('mediaId');
    const download = searchParams.get('download') === 'true';

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('API /api/media error: WHATSAPP_ACCESS_TOKEN is not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error: No access token available' }, { status: 500 });
    }

    // Step 1: Retrieve the media URL from Meta Graph API
    const metaGraphUrl = `https://graph.facebook.com/v25.0/${mediaId}`;
    const urlResponse = await fetch(metaGraphUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!urlResponse.ok) {
      const errorData = await urlResponse.json().catch(() => ({}));
      console.error(`Failed to fetch media url for id ${mediaId}:`, errorData);
      return NextResponse.json({ error: 'Failed to find media URL on Meta Graph', details: errorData }, { status: urlResponse.status });
    }

    const { url, mime_type } = await urlResponse.json();
    if (!url) {
      console.error(`Graph API response did not contain a URL for mediaId ${mediaId}`);
      return NextResponse.json({ error: 'Graph API response did not contain a URL' }, { status: 500 });
    }

    // Step 2: Fetch the actual binary stream from Meta's secure server
    const binaryResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!binaryResponse.ok) {
      console.error(`Failed to download binary for id ${mediaId} from url ${url}. Status: ${binaryResponse.status}`);
      return NextResponse.json({ error: 'Failed to download binary from Meta' }, { status: binaryResponse.status });
    }

    // Pass headers along, specifically Content-Type to allow browser rendering
    const headers = new Headers();
    if (mime_type) {
      headers.set('Content-Type', mime_type);
    } else {
      headers.set('Content-Type', 'application/octet-stream'); // Fallback
    }
    
    if (download) {
       // Force download prompt
       headers.set('Content-Disposition', `attachment; filename="media_${mediaId}"`);
    } else {
       // Render inline for img, video, audio tags
       headers.set('Content-Disposition', 'inline');
    }

    // Provide cache controls so the browser remembers the media natively
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // Return the readable stream directly to the client nextjs response
    return new NextResponse(binaryResponse.body, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('API /api/media error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
