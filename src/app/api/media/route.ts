import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import MessageModel from '@/models/Message';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaId = searchParams.get('mediaId');
    const download = searchParams.get('download') === 'true';

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // === STEP 0: Check local MongoDB cache first ===
    try {
      await connectMongoDB();
      const cached = await MessageModel.findOne(
        { mediaId, mediaData: { $exists: true, $ne: null } },
        { mediaData: 1, mimeType: 1, filename: 1 }
      ).lean();

      if (cached && (cached as any).mediaData) {
        console.log(`[media] Serving cached media for id ${mediaId}`);
        const buffer = Buffer.from((cached as any).mediaData, 'base64');
        const contentType = (cached as any).mimeType || 'application/octet-stream';

        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Length', buffer.byteLength.toString());
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        
        if (download) {
          headers.set('Content-Disposition', `attachment; filename="${(cached as any).filename || `media_${mediaId}`}"`);
        } else {
          headers.set('Content-Disposition', 'inline');
        }

        return new NextResponse(buffer, { status: 200, headers });
      }
    } catch (dbErr) {
      console.error('[media] Cache lookup failed (non-fatal):', dbErr);
      // Fall through to Meta API
    }

    // === STEP 1: Fallback to Meta Graph API (for non-cached or old messages) ===
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('API /api/media error: WHATSAPP_ACCESS_TOKEN is not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error: No access token available' }, { status: 500 });
    }

    // Retrieve the media URL from Meta Graph API
    const metaGraphUrl = `https://graph.facebook.com/v19.0/${mediaId}`;
    const urlResponse = await fetch(metaGraphUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!urlResponse.ok) {
      const errorData = await urlResponse.json().catch(() => ({}));
      console.error(`Failed to fetch media url for id ${mediaId}:`, errorData);
      
      // If Meta says the object doesn't exist (expired), return a clear message
      if (errorData?.error?.code === 100) {
        return NextResponse.json(
          { error: 'Media has expired on WhatsApp servers. New media will be cached automatically.' },
          { status: 410 } // 410 Gone
        );
      }
      return NextResponse.json({ error: 'Failed to find media URL on Meta Graph', details: errorData }, { status: urlResponse.status });
    }

    const { url, mime_type } = await urlResponse.json();
    if (!url) {
      console.error(`Graph API response did not contain a URL for mediaId ${mediaId}`);
      return NextResponse.json({ error: 'Graph API response did not contain a URL' }, { status: 500 });
    }

    // Fetch the actual binary stream from Meta's secure server
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

    // === STEP 2: Cache the media we just downloaded for future use ===
    try {
      const arrayBuffer = await binaryResponse.arrayBuffer();
      if (arrayBuffer.byteLength < 10 * 1024 * 1024) {
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        await MessageModel.updateOne(
          { mediaId },
          { $set: { mediaData: base64Data, mimeType: mime_type || 'application/octet-stream' } }
        );
        console.log(`[media] Retroactively cached media ${mediaId} (${arrayBuffer.byteLength} bytes)`);
        
        // Serve from the buffer we already have
        const headers = new Headers();
        headers.set('Content-Type', mime_type || 'application/octet-stream');
        headers.set('Content-Length', arrayBuffer.byteLength.toString());
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        if (download) {
          headers.set('Content-Disposition', `attachment; filename="media_${mediaId}"`);
        } else {
          headers.set('Content-Disposition', 'inline');
        }
        return new NextResponse(Buffer.from(arrayBuffer), { status: 200, headers });
      }
      
      // For large files, stream without caching
      const headers = new Headers();
      headers.set('Content-Type', mime_type || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      if (download) {
        headers.set('Content-Disposition', `attachment; filename="media_${mediaId}"`);
      } else {
        headers.set('Content-Disposition', 'inline');
      }
      return new NextResponse(Buffer.from(arrayBuffer), { status: 200, headers });
    } catch (cacheErr) {
      console.error('[media] Retroactive cache failed:', cacheErr);
      return NextResponse.json({ error: 'Failed to process media' }, { status: 500 });
    }

  } catch (error) {
    console.error('API /api/media error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
