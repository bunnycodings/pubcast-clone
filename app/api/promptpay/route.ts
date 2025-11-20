import { NextRequest, NextResponse } from 'next/server';
import { buildPromptPayPayload, validatePromptPayId } from '@/lib/promptpay';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/promptpay
 * 
 * Generates a PromptPay QR code payload
 * 
 * Request body:
 * - promptpayId?: string - PromptPay ID (phone or ID). If not provided, uses env var.
 * - amount?: number - Amount in THB (optional, 0 or blank for open amount)
 * - message?: string - Optional message (for reference only, not in QR)
 * 
 * Response:
 * - Success: { payload: string, promptpayId: string, amount?: number }
 * - Error: { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptpayId, amount, message } = body;

    // Get PromptPay ID from request or environment variable
    const finalPromptpayId = promptpayId || process.env.NEXT_PUBLIC_DEFAULT_PROMPTPAY_ID;

    // Validation: promptpayId is required
    if (!finalPromptpayId || typeof finalPromptpayId !== 'string' || finalPromptpayId.trim() === '') {
      return NextResponse.json(
        { error: 'PromptPay ID is required. Please provide promptpayId or set NEXT_PUBLIC_DEFAULT_PROMPTPAY_ID environment variable.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate PromptPay ID format
    if (!validatePromptPayId(finalPromptpayId)) {
      return NextResponse.json(
        { error: 'Invalid PromptPay ID format. Must be a 10-digit phone number (starting with 0) or 13-digit ID.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate amount if provided
    let finalAmount: number | undefined = undefined;
    if (amount !== undefined && amount !== null) {
      const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (isNaN(amountNum) || !isFinite(amountNum)) {
        return NextResponse.json(
          { error: 'Amount must be a valid number.' },
          { status: 400, headers: corsHeaders }
        );
      }

      if (amountNum < 0) {
        return NextResponse.json(
          { error: 'Amount must be 0 or greater.' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Max amount check (1,000,000 THB)
      if (amountNum > 1000000) {
        return NextResponse.json(
          { error: 'Amount cannot exceed 1,000,000 THB.' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Only include amount if > 0 (0 means open amount)
      if (amountNum > 0) {
        finalAmount = amountNum;
      }
    }

    // Generate PromptPay payload
    const payload = buildPromptPayPayload(finalPromptpayId, finalAmount);

    // Return success response
    const response: {
      payload: string;
      promptpayId: string;
      amount?: number;
    } = {
      payload,
      promptpayId: finalPromptpayId,
    };

    if (finalAmount !== undefined) {
      response.amount = finalAmount;
    }

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error generating PromptPay QR:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PromptPay QR code' },
      { status: 500, headers: corsHeaders }
    );
  }
}

