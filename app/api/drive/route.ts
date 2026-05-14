import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure user is authenticated and we have the access token
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: 'Not authenticated or missing access token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: (session as any).accessToken });

    const drive = google.drive({ version: 'v3', auth });

    // We use alt: 'media' to download the file content
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'text' }
    );

    return new NextResponse(response.data as string, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error: any) {
    console.error('Google Drive fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Google Drive', details: error.message }, { status: 500 });
  }
}
