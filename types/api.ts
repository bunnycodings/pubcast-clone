/**
 * Shared TypeScript types for PromptPay QR API
 */

export interface PromptPayQrRequest {
  promptpayId: string;
  amount: number | null;
  description?: string | null;
}

export interface PromptPayQrSuccessResponse {
  payload: string;
  qrDataUrl: string;
  expiresAt?: string; // ISO timestamp string
}

export interface PromptPayQrErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type PromptPayQrResponse = PromptPayQrSuccessResponse | PromptPayQrErrorResponse;

