import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/line-notify
 * 
 * Sends a LINE Messaging API push message when payment is completed
 * 
 * Request body:
 * - message: string - The message to send
 * 
 * Uses LINE_CHANNEL_SECRET (required) and optionally LINE_CHANNEL_ACCESS_TOKEN for sending messages
 * Sends to LINE_USER_ID or LINE_GROUP_ID (if configured and access token is provided)
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

    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const lineUserId = process.env.LINE_USER_ID;
    const lineGroupId = process.env.LINE_GROUP_ID;

    // Check if LINE is configured (at minimum, channel secret is required)
    if (!channelSecret) {
      console.error('LINE_CHANNEL_SECRET is not configured');
      return NextResponse.json(
        { success: false, error: 'LINE Messaging API not configured' },
        { status: 500 }
      );
    }

    // If channel access token is not provided, we can't send messages
    // But we'll return success since channel secret is configured (for webhook verification)
    if (!channelAccessToken) {
      console.warn('LINE_CHANNEL_ACCESS_TOKEN is not configured - skipping message send');
      return NextResponse.json({ 
        success: true, 
        message: 'LINE configured but message not sent (access token required for sending)' 
      });
    }

    // Check if we have a recipient (user ID or group ID)
    if (!lineUserId && !lineGroupId) {
      console.warn('LINE_USER_ID or LINE_GROUP_ID is not configured - skipping message send');
      return NextResponse.json({ 
        success: true, 
        message: 'LINE configured but message not sent (user/group ID required for sending)' 
      });
    }

    // Use user ID if available, otherwise use group ID
    const to = lineUserId || lineGroupId;

    // Send push message using LINE Messaging API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: to,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('LINE Messaging API error:', data);
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to send LINE message' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    );
  }
}

