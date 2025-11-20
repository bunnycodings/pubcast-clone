import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/check
 * Check if admin is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify admin session in database
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u227507338_pubcast_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
      const [admins] = await connection.execute(
        'SELECT id, username FROM admin_users WHERE id = ?',
        [adminSession]
      ) as any[];

      await connection.end();

      if (!Array.isArray(admins) || admins.length === 0) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        admin: {
          id: admins[0].id,
          username: admins[0].username,
        },
      });
    } catch (dbError) {
      await connection.end();
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}

