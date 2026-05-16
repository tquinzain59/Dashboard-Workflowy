import { NextResponse } from 'next/server';

const WORKFLOWY_API_KEY = '77415177db61774cd14bfe80ad95e85683f48e82';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const itemId = body.item_id || 'None';

    const response = await fetch('https://beta.workflowy.com/api/beta/list-children/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKFLOWY_API_KEY}`
      },
      body: JSON.stringify({ item_id: itemId }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Workflowy API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Workflowy Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from Workflowy' }, { status: 500 });
  }
}
