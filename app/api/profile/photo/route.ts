import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * PUT /api/profile/photo
 * 
 * Update user profile photo
 * 
 * Request body:
 * - profilePhoto: string - Base64 encoded image or image URL
 * 
 * Response:
 * - Success (200): { success: true, profilePhoto: string }
 * - Error (400/500): { error: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profilePhoto } = body;

    // Allow null to remove photo, but if provided, must be string
    if (profilePhoto !== null && profilePhoto !== undefined) {
      if (typeof profilePhoto !== 'string') {
        return NextResponse.json(
          { error: 'Profile photo must be a string or null' },
          { status: 400 }
        );
      }

      // Validate base64 image format (basic check)
      if (profilePhoto.startsWith('data:image/')) {
        // Validate it's a reasonable size (max 2MB)
        const base64Data = profilePhoto.split(',')[1];
        if (base64Data) {
          const sizeInBytes = (base64Data.length * 3) / 4;
          if (sizeInBytes > 2 * 1024 * 1024) {
            return NextResponse.json(
              { error: 'Image size must be less than 2MB' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Update database
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u227507338_pubcast_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
      // First, check if the column exists and its type
      try {
        // Try to check if column exists by describing the table
        const [columns] = await connection.execute(
          'SHOW COLUMNS FROM users LIKE "profile_photo"'
        ) as any[];

        // If column doesn't exist, add it as MEDIUMTEXT
        if (!Array.isArray(columns) || columns.length === 0) {
          await connection.execute(
            'ALTER TABLE users ADD COLUMN profile_photo MEDIUMTEXT NULL AFTER phone_number'
          );
        } else {
          // Column exists, check if it's TEXT and needs to be upgraded to MEDIUMTEXT
          const columnInfo = columns[0];
          const columnType = columnInfo?.Type?.toUpperCase() || '';
          if (columnType.includes('TEXT') && !columnType.includes('MEDIUMTEXT') && !columnType.includes('LONGTEXT')) {
            // Upgrade from TEXT to MEDIUMTEXT to support larger images
            try {
              await connection.execute(
                'ALTER TABLE users MODIFY COLUMN profile_photo MEDIUMTEXT NULL'
              );
              console.log('Upgraded profile_photo column from TEXT to MEDIUMTEXT');
            } catch (upgradeError) {
              console.log('Could not upgrade column type (may need manual migration):', upgradeError);
            }
          }
        }
      } catch (alterError) {
        // Column might already exist or there's a permission issue
        console.log('Column check/creation:', alterError);
      }

      // Now update the profile photo
      await connection.execute(
        'UPDATE users SET profile_photo = ? WHERE id = ?',
        [profilePhoto, userId]
      );

      await connection.end();

      return NextResponse.json({
        success: true,
        profilePhoto: profilePhoto,
      });
    } catch (dbError: any) {
      await connection.end();
      console.error('Database error details:', dbError);
      // Return more detailed error message
      const errorMessage = dbError?.message || 'Database error';
      throw new Error(`Database error: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error updating profile photo:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update profile photo' 
      },
      { status: 500 }
    );
  }
}

