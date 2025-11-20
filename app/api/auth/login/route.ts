import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface LoginRequest {
  phoneNumber: string;
}

/**
 * POST /api/auth/login
 * 
 * Login user by phone number
 * 
 * Request body:
 * - phoneNumber: string - Phone number
 * 
 * Response:
 * - Success (200): { success: true, user: { id, username, phoneNumber } }
 * - Error (400/404/500): { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginRequest;
    const { phoneNumber } = body;

    // Validation
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      return NextResponse.json(
        { error: 'เบอร์โทรศัพท์ (phone number) จำเป็นต้องกรอก' },
        { status: 400 }
      );
    }

    // Validate phone number format (Thai phone: 10 digits starting with 0)
    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!/^0\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก ขึ้นต้นด้วย 0)' },
        { status: 400 }
      );
    }

    // Connect to MySQL database
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
        ? 'SELECT id, username, phone_number, profile_photo FROM users WHERE phone_number = ?'
        : 'SELECT id, username, phone_number FROM users WHERE phone_number = ?';

      // Find user by phone number
      const [users] = await connection.execute(
        selectQuery,
        [cleanedPhone]
      ) as any[];

      await connection.end();

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: 'ไม่พบบัญชีผู้ใช้' },
          { status: 404 }
        );
      }

      const user = users[0];
      
      // Set cookies on server side
      const cookieStore = await cookies();
      cookieStore.set('user_id', user.id.toString(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: false, // Allow client-side access
      });
      cookieStore.set('username', user.username, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
      cookieStore.set('phone_number', user.phone_number, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
      
      return NextResponse.json({
        success: true,
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
      throw dbError;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}

