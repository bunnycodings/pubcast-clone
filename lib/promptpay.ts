import generatePayload from 'promptpay-qr';

/**
 * Normalizes a Thai phone number to PromptPay format
 * 
 * Converts formats like "08xxxxxxxx" to the format needed by the library.
 * The promptpay-qr library accepts phone numbers as-is, but this function
 * ensures consistent formatting by removing spaces/dashes.
 * 
 * For international format conversion (e.g., 08xxxxxxxx -> 00668xxxxxxxx),
 * the promptpay-qr library handles this internally, so we just clean the input.
 * 
 * @param phone - Thai phone number (e.g., "0812345678" or "081-234-5678")
 * @returns Normalized phone number string
 */
export function normalizePhoneToPromptPay(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }
  
  // Remove spaces, dashes, and other formatting
  const cleaned = phone.replace(/[\s-]/g, '');
  
  return cleaned;
}

/**
 * Builds a PromptPay QR code payload string (EMV-compliant)
 * 
 * This function wraps the promptpay-qr library to generate the EMV-compliant
 * QR code payload that can be used to create a QR code image.
 * 
 * The payload follows the Thai QR Payment standard (PromptPay) which is based
 * on EMV QR Code specification (EMVCo). When a user scans this QR code with their
 * banking app, it will prompt them to transfer money to the specified ID.
 * 
 * EMV QR Code Structure (TLV - Tag, Length, Value):
 * 
 * 00 - Payload Format Indicator (always "01" for EMV)
 * 01 - Point of Initiation Method ("11" = static, "12" = dynamic)
 * 30 - Merchant Account Information:
 *      - 00: GUID (AID) - "A000000677010111" for PromptPay
 *      - 01: Merchant ID (phone number or citizen ID)
 * 54 - Transaction Amount (optional, in THB)
 * 58 - Country Code ("TH" for Thailand)
 * 53 - Currency Code ("764" for THB)
 * 63 - CRC (Cyclic Redundancy Check) - 4 hex digits
 * 
 * CRC Calculation:
 * The CRC-16/CCITT-FALSE algorithm is used:
 * - Polynomial: 0x1021
 * - Initial value: 0xFFFF
 * - Final XOR: 0x0000
 * The promptpay-qr library handles CRC calculation automatically.
 * 
 * Example payload structure:
 * 000201                    // EMV header + format indicator
 * 010212                    // Point of initiation (12 = dynamic)
 * 30...                     // Merchant account info
 *   00 16 A000000677010111  // AID for PromptPay
 *   01 0A 0812345678        // Merchant ID (phone number)
 * 54 06 100.00              // Amount (if provided)
 * 58 02 TH                  // Country code
 * 53 03 764                 // Currency (THB)
 * 63 04 ABCD                // CRC checksum
 * 
 * @param promptpayId - The PromptPay ID (phone number starting with 0, or 13-digit ID)
 * @param amount - Optional amount in THB. If not provided, generates a static QR without amount
 * @returns The PromptPay/EMV payload string (starts with "000201...")
 */
export function buildPromptPayPayload(
  promptpayId: string,
  amount?: number
): string {
  // Normalize the phone number format
  const normalizedId = normalizePhoneToPromptPay(promptpayId);
  
  // Use the promptpay-qr library to generate the payload
  // The library handles the EMV QR code format internally, including:
  // - TLV encoding
  // - CRC-16/CCITT-FALSE calculation
  // - Proper formatting for Thai phone numbers (converts to international format if needed)
  const options: { amount?: number } = {};
  
  // Only include amount if it's provided and positive
  // If amount is omitted or 0, the QR will be "open amount" (user enters amount in app)
  if (amount !== undefined && amount !== null && amount > 0) {
    options.amount = amount;
  }

  // Generate the EMV-compliant payload
  // The library returns a string starting with "000201" (EMV header)
  const payload = generatePayload(normalizedId, options);
  return payload;
}

/**
 * Validates a PromptPay ID format
 * 
 * PromptPay IDs can be:
 * - Phone numbers (10 digits, starting with 0)
 * - National ID / Tax ID (13 digits)
 * 
 * @param promptPayId - The PromptPay ID to validate
 * @returns true if valid, false otherwise
 */
export function validatePromptPayId(promptPayId: string): boolean {
  if (!promptPayId || typeof promptPayId !== 'string') {
    return false;
  }

  // Remove any spaces, dashes, or other formatting
  const cleaned = promptPayId.replace(/[\s-]/g, '');

  // Check for phone number format (10 digits, starts with 0)
  const phonePattern = /^0\d{9}$/;
  if (phonePattern.test(cleaned)) {
    return true;
  }

  // Check for ID format (13 digits)
  const idPattern = /^\d{13}$/;
  if (idPattern.test(cleaned)) {
    return true;
  }

  return false;
}

