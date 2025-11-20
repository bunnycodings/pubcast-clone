import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// For this example, we'll use a simple in-memory store or you can connect to MySQL
// In production, you should use a proper database connection

interface RegisterRequest {
  username: string;
  phoneNumber: string;
}

/**
 * POST /api/auth/register
 * 
 * Register a new user account
 * 
 * Request body:
 * - username: string - Account username (unique)
 * - phoneNumber: string - Phone number
 * 
 * Response:
 * - Success (200): { success: true, user: { id, username, phoneNumber } }
 * - Error (400/500): { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterRequest;
    const { username, phoneNumber } = body;

    // Validation
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json(
        { error: 'ชื่อบัญชี (username) จำเป็นต้องกรอก' },
        { status: 400 }
      );
    }

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

    // Validate username (alphanumeric, 3-20 characters)
    const cleanedUsername = username.trim();
    if (cleanedUsername.length < 3 || cleanedUsername.length > 20) {
      return NextResponse.json(
        { error: 'ชื่อบัญชีต้องมีความยาว 3-20 ตัวอักษร' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
      return NextResponse.json(
        { error: 'ชื่อบัญชีสามารถใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ เท่านั้น' },
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
      // Check if username exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [cleanedUsername]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        await connection.end();
        return NextResponse.json(
          { error: 'ชื่อบัญชีนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }

      // Check if phone number exists
      const [existingPhone] = await connection.execute(
        'SELECT id FROM users WHERE phone_number = ?',
        [cleanedPhone]
      );

      if (Array.isArray(existingPhone) && existingPhone.length > 0) {
        await connection.end();
        return NextResponse.json(
          { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }

      // Insert new user
      const [result] = await connection.execute(
        'INSERT INTO users (username, phone_number) VALUES (?, ?)',
        [cleanedUsername, cleanedPhone]
      ) as any[];

      await connection.end();

      // Set cookies on server side
      const cookieStore = await cookies();
      cookieStore.set('user_id', result.insertId.toString(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: false, // Allow client-side access
      });
      cookieStore.set('username', cleanedUsername, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
      cookieStore.set('phone_number', cleanedPhone, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: result.insertId.toString(),
          username: cleanedUsername,
          phoneNumber: cleanedPhone,
        },
      });
    } catch (dbError: any) {
      await connection.end();
      console.error('Database error:', dbError);
      
      // Handle duplicate entry errors
      if (dbError.code === 'ER_DUP_ENTRY') {
        if (dbError.message.includes('username')) {
          return NextResponse.json(
            { error: 'ชื่อบัญชีนี้ถูกใช้งานแล้ว' },
            { status: 400 }
          );
        } else if (dbError.message.includes('phone_number')) {
          return NextResponse.json(
            { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' },
            { status: 400 }
          );
        }
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}

