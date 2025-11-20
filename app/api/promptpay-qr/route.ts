import { NextRequest, NextResponse } from 'next/server';
import { buildPromptPayPayload, validatePromptPayId } from '@/lib/promptpay';
import { generateQrDataUrl } from '@/lib/qrcode';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Request body type for /api/promptpay-qr
 */
interface PromptPayQrRequest {
  amount?: number;      // Optional, THB
  message?: string;     // Optional, for future use
}

/**
 * Success response type
 */
interface PromptPayQrSuccessResponse {
  payload: string;      // EMV payload string
  qrDataUrl: string;    // Data URL of QR image (PNG or SVG)
}

/**
 * Error response type
 */
interface PromptPayQrErrorResponse {
  error: string;        // Error message
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/promptpay-qr
 * 
 * Generates a PromptPay QR code payload and image
 * 
 * Request body:
 * - amount?: number - Amount in THB (optional)
 * - message?: string - Optional message (for future use)
 * 
 * Uses PROMPTPAY_ID from environment variable as the static PromptPay ID.
 * 
 * Response:
 * - Success (200): { payload: string, qrDataUrl: string }
 * - Error (400/500): { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PromptPayQrRequest;
    const { amount, message } = body;

    // Get static PromptPay ID from environment variable
    const promptpayId = process.env.PROMPTPAY_ID;

    // Validation: PROMPTPAY_ID must be set
    if (!promptpayId || typeof promptpayId !== 'string' || promptpayId.trim() === '') {
      return NextResponse.json(
        { error: 'PROMPTPAY_ID environment variable is not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Validate PromptPay ID format
    if (!validatePromptPayId(promptpayId)) {
      return NextResponse.json(
        { error: 'Invalid PROMPTPAY_ID format. Must be a 10-digit phone number (starting with 0) or 13-digit ID' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && amount !== null) {
      if (typeof amount !== 'number' || !isFinite(amount)) {
        return NextResponse.json(
          { error: 'Amount must be a valid number' },
          { status: 400, headers: corsHeaders }
        );
      }

      if (amount < 0) {
        return NextResponse.json(
          { error: 'Amount must be 0 or greater' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Reasonable max amount check (1,000,000 THB)
      if (amount > 1000000) {
        return NextResponse.json(
          { error: 'Amount cannot exceed 1,000,000 THB' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Generate PromptPay payload
    // If amount is undefined/null/0, don't include it (generates static/open amount QR)
    const finalAmount = amount && amount > 0 ? amount : undefined;
    const payload = buildPromptPayPayload(promptpayId.trim(), finalAmount);

    // Generate QR code as data URL (SVG format for better scalability)
    const qrDataUrl = await generateQrDataUrl(payload);

    // Return success response
    const successResponse: PromptPayQrSuccessResponse = {
      payload,
      qrDataUrl,
    };

    return NextResponse.json(successResponse, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating PromptPay QR:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate QR code' },
      { status: 500, headers: corsHeaders }
    );
  }
}

