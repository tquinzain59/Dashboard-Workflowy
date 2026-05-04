import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lille coordinates
    const lat = 50.6292;
    const lon = 3.0573;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API failed");
    
    const data = await res.json();
    return NextResponse.json(data.current_weather);
  } catch (error) {
    console.error('Weather error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
