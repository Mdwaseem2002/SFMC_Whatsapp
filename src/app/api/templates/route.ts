// src/app/api/templates/route.ts
// Fetches all APPROVED WhatsApp message templates from Meta
// Used by Journey Builder activity UI dropdown

import { NextResponse } from 'next/server';

interface MetaTemplate {
  name: string;
  status: string;
  language: string;
  category: string;
  id: string;
  components?: Array<{
    type: string;
    text?: string;
    format?: string;
    example?: Record<string, unknown>;
    buttons?: Array<Record<string, unknown>>;
  }>;
}

interface MetaTemplatesResponse {
  data: MetaTemplate[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export async function GET() {
  try {
    // ----- Env Vars -----
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WABA_ID;

    if (!accessToken || !wabaId) {
      console.error('[templates] Missing WHATSAPP_ACCESS_TOKEN or WABA_ID');
      return NextResponse.json(
        { error: 'Server configuration error: WhatsApp credentials not configured' },
        { status: 500 }
      );
    }

    // ----- Fetch Templates with Pagination -----
    const allTemplates: MetaTemplate[] = [];
    let nextUrl: string | null = `https://graph.facebook.com/v25.0/${wabaId}/message_templates?limit=100`;

    console.log('[templates] Fetching approved templates from Meta...');

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[templates] Meta API error:', JSON.stringify(errorData));
        return NextResponse.json(
          { error: 'Failed to fetch templates from Meta', details: errorData },
          { status: 502 }
        );
      }

      const data: MetaTemplatesResponse = await response.json();

      if (data.data && Array.isArray(data.data)) {
        allTemplates.push(...data.data);
      }

      // Follow pagination if more pages exist
      nextUrl = data.paging?.next || null;
    }

    // ----- Filter Only APPROVED Templates -----
    const approvedTemplates = allTemplates.filter(
      (template) => template.status === 'APPROVED'
    );

    console.log(`[templates] Found ${approvedTemplates.length} approved templates out of ${allTemplates.length} total`);

    // ----- Return Clean Response -----
    const cleanTemplates = approvedTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      language: template.language,
      category: template.category,
      status: template.status,
      components: template.components || [],
    }));

    return NextResponse.json({
      success: true,
      templates: cleanTemplates,
      count: cleanTemplates.length,
    });
  } catch (error) {
    console.error('[templates] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
