import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/user
 * 
 * Get current user information from session
 * 
 * Response:
 * - Success (200): { user: { id, username, phoneNumber } }
 * - Not logged in (401): { error: 'Not authenticated' }
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from cookie/session
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const username = cookieStore.get('username')?.value;
    const phoneNumber = cookieStore.get('phone_number')?.value;

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch from database
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u227507338_pubcast_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
      // First, check if profile_photo column exists
      let hasProfilePhotoColumn = false;
      try {
        const [columns] = await connection.execute(
          'SHOW COLUMNS FROM users LIKE "profile_photo"'
        ) as any[];
        hasProfilePhotoColumn = Array.isArray(columns) && columns.length > 0;
      } catch (e) {
        // Column check failed, assume it doesn't exist
        hasProfilePhotoColumn = false;
      }

      // Build SELECT query based on whether column exists
      const selectQuery = hasProfilePhotoColumn
        ? 'SELECT id, username, phone_number, profile_photo FROM users WHERE id = ?'
        : 'SELECT id, username, phone_number FROM users WHERE id = ?';

      const [users] = await connection.execute(
        selectQuery,
        [userId]
      ) as any[];

      await connection.end();

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = users[0];
      return NextResponse.json({
        user: {
          id: user.id.toString(),
          username: user.username,
          phoneNumber: user.phone_number,
          profilePhoto: hasProfilePhotoColumn ? (user.profile_photo || undefined) : undefined,
        },
      });
    } catch (dbError) {
      await connection.end();
      console.error('Database error:', dbError);
      // Fallback to cookies if database fails
      return NextResponse.json({
        user: {
          id: userId,
          username: username,
          phoneNumber: phoneNumber || '',
          profilePhoto: undefined,
        },
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}

