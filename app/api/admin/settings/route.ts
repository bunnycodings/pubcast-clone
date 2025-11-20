import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/settings
 * Get all settings
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Connect to database
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u227507338_pubcast_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
      const [settings] = await connection.execute(
        'SELECT setting_key, setting_value FROM settings'
      ) as any[];

      await connection.end();

      const settingsObj: Record<string, any> = {};
      settings.forEach((setting: any) => {
        try {
          settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settingsObj[setting.setting_key] = setting.setting_value;
        }
      });

      return NextResponse.json({
        success: true,
        settings: settingsObj,
      });
    } catch (dbError) {
      await connection.end();
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update settings
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { services, promo_text, promo_subtext } = body;

    // Connect to database
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u227507338_pubcast_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
      // Update services
      if (services) {
        await connection.execute(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          ['services', JSON.stringify(services), JSON.stringify(services)]
        );
      }

      // Update promo text
      if (promo_text !== undefined) {
        await connection.execute(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          ['promo_text', promo_text, promo_text]
        );
      }

      // Update promo subtext
      if (promo_subtext !== undefined) {
        await connection.execute(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          ['promo_subtext', promo_subtext, promo_subtext]
        );
      }

      await connection.end();

      return NextResponse.json({
        success: true,
      });
    } catch (dbError) {
      await connection.end();
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}

