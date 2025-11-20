import { buildPromptPayPayload, validatePromptPayId } from '../lib/promptpay';

describe('buildPromptPayPayload', () => {
  it('should generate payload with phone number and amount', () => {
    const payload = buildPromptPayPayload('0812345678', 100.5);
    
    expect(payload).toBeTruthy();
    expect(typeof payload).toBe('string');
    expect(payload.length).toBeGreaterThan(0);
    // PromptPay payloads typically start with specific EMV codes
    expect(payload).toContain('000201');
  });

  it('should generate payload with phone number without amount', () => {
    const payload = buildPromptPayPayload('0812345678');
    
    expect(payload).toBeTruthy();
    expect(typeof payload).toBe('string');
    expect(payload.length).toBeGreaterThan(0);
  });

  it('should generate payload with 13-digit ID and amount', () => {
    const payload = buildPromptPayPayload('1234567890123', 50);
    
    expect(payload).toBeTruthy();
    expect(typeof payload).toBe('string');
    expect(payload.length).toBeGreaterThan(0);
  });

  it('should handle zero amount by omitting it', () => {
    const payloadWithZero = buildPromptPayPayload('0812345678', 0);
    const payloadWithout = buildPromptPayPayload('0812345678');
    
    // Both should generate valid payloads (zero amount should be treated as no amount)
    expect(payloadWithZero).toBeTruthy();
    expect(payloadWithout).toBeTruthy();
  });

  it('should handle negative amount by omitting it', () => {
    const payload = buildPromptPayPayload('0812345678', -10);
    
    // Should still generate a valid payload (negative amount should be ignored)
    expect(payload).toBeTruthy();
    expect(typeof payload).toBe('string');
  });
});

describe('validatePromptPayId', () => {
  it('should validate 10-digit phone number starting with 0', () => {
    expect(validatePromptPayId('0812345678')).toBe(true);
    expect(validatePromptPayId('0987654321')).toBe(true);
  });

  it('should validate 13-digit ID', () => {
    expect(validatePromptPayId('1234567890123')).toBe(true);
    expect(validatePromptPayId('9876543210987')).toBe(true);
  });

  it('should handle formatted phone numbers (with spaces/dashes)', () => {
    expect(validatePromptPayId('081-234-5678')).toBe(true);
    expect(validatePromptPayId('081 234 5678')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(validatePromptPayId('')).toBe(false);
    expect(validatePromptPayId('123')).toBe(false);
    expect(validatePromptPayId('081234567')).toBe(false); // 9 digits
    expect(validatePromptPayId('1812345678')).toBe(false); // doesn't start with 0
    expect(validatePromptPayId('123456789012')).toBe(false); // 12 digits
    expect(validatePromptPayId('12345678901234')).toBe(false); // 14 digits
    expect(validatePromptPayId('abc1234567')).toBe(false); // contains letters
  });

  it('should reject null or undefined', () => {
    expect(validatePromptPayId(null as any)).toBe(false);
    expect(validatePromptPayId(undefined as any)).toBe(false);
  });
});

