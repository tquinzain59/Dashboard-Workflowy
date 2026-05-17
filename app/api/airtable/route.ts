import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = url.searchParams.get('offset');
  const baseId = 'appByiSwT6H8X0uF8';
  const tableId = 'tblBWfxHhsdofgvpS';
  
  let fetchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  if (offset) {
    fetchUrl += `?offset=${offset}`;
  }

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Airtable Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from Airtable' }, { status: 500 });
  }
}
