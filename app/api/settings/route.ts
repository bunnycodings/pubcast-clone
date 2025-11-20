import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/settings
 * Get public settings (services and promo text)
 */
export async function GET(request: NextRequest) {
  try {
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
        'SELECT setting_key, setting_value FROM settings WHERE setting_key IN (?, ?, ?)',
        ['services', 'promo_text', 'promo_subtext']
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

      // Convert services object to array format (for compatibility with existing code)
      let servicesArray: any[] = [];
      if (settingsObj.services) {
        servicesArray = Object.values(settingsObj.services);
      }

      return NextResponse.json({
        services: servicesArray,
        servicesObj: settingsObj.services, // Also return as object for flexibility
        promoText: settingsObj.promo_text || "",
        promoSubtext: settingsObj.promo_subtext || "",
      });
    } catch (dbError) {
      await connection.end();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to get settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

