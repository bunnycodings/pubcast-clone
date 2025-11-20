import QRCode from 'qrcode';

/**
 * Generates a QR code image as a data URL (SVG format for better scalability)
 * 
 * This utility function converts a text payload (like a PromptPay payload)
 * into a QR code image that can be displayed directly in HTML using the
 * data URL format.
 * 
 * The function is designed to work in serverless environments (like Vercel)
 * and does not require DOM APIs or filesystem access.
 * 
 * Uses SVG format for better scalability and smaller file size compared to PNG.
 * 
 * @param payload - The text string to encode in the QR code
 * @returns A Promise that resolves to a data URL string (data:image/svg+xml;base64,...)
 */
export async function generateQrDataUrl(payload: string): Promise<string> {
  if (!payload || typeof payload !== 'string') {
    throw new Error('Payload must be a non-empty string');
  }

  try {
    // Generate SVG format for better scalability
    const svgString = await QRCode.toString(payload, {
      type: 'svg',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M', // Medium error correction (good balance)
    });

    // Convert SVG string to base64 data URL
    const base64 = Buffer.from(svgString).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    return dataUrl;
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

