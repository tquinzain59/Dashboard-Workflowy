import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { google } from 'googleapis';

export async function GET(req: Request) {
  try {
    const session = await getServerSession() as any;
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Fetch last 5 important or unread messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:important OR is:unread',
      maxResults: 5,
    });

    const messages = response.data.messages || [];
    
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });
        
        const headers = detail.data.payload?.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value || 'Sans objet';
        const from = headers.find(h => h.name === 'From')?.value || 'Inconnu';
        
        return {
          id: msg.id,
          subject,
          from: from.replace(/<.*>/, '').trim(), // Clean up email format "Name <email@dom.com>"
          snippet: detail.data.snippet
        };
      })
    );

    return NextResponse.json(detailedMessages);
  } catch (error) {
    console.error('Gmail error:', error);
    return NextResponse.json({ error: 'Failed to fetch gmail' }, { status: 500 });
  }
}
