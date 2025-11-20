import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/line-notify
 * 
 * Sends a LINE Notify message when payment is completed
 * 
 * Request body:
 * - message: string - The message to send
 * 
 * Uses LINE_NOTIFY_TOKEN from environment variable
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const lineNotifyToken = process.env.LINE_NOTIFY_TOKEN;

    if (!lineNotifyToken) {
      console.error('LINE_NOTIFY_TOKEN is not configured');
      // Don't fail the request, just log the error
      return NextResponse.json(
        { success: false, error: 'LINE Notify not configured' },
        { status: 500 }
      );
    }

    // Send notification to LINE Notify
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${lineNotifyToken}`,
      },
      body: new URLSearchParams({
        message: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('LINE Notify error:', data);
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to send LINE notification' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    );
  }
}

