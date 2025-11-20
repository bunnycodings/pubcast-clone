"use client";

import { useState } from "react";

/**
 * Props for PromptPayDonationWidget component
 */
interface PromptPayDonationWidgetProps {
  className?: string;
  promptpayId?: string; // Optional: If provided, will display masked ID. Otherwise shows generic message.
}

/**
 * Response type from /api/promptpay-qr
 */
interface PromptPayQrResponse {
  payload?: string;
  qrDataUrl?: string;
  error?: string;
}

/**
 * PromptPayDonationWidget - A reusable React component for PromptPay donations
 * 
 * Features:
 * - Input for amount (THB)
 * - Optional message/memo field
 * - Generate QR button
 * - Displays QR code image
 * - Shows amount and masked PromptPay ID
 * 
 * Usage:
 * ```tsx
 * <PromptPayDonationWidget />
 * ```
 */
export default function PromptPayDonationWidget({
  className = "",
  promptpayId: propPromptpayId,
}: PromptPayDonationWidgetProps) {
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<PromptPayQrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Masks a PromptPay ID for display (e.g., "0812345678" -> "xxx-xxx-5678")
   */
  const maskPromptPayId = (id: string): string => {
    if (!id) return "";
    const cleaned = id.replace(/[\s-]/g, "");
    if (cleaned.length === 10) {
      // Phone number: 0812345678 -> xxx-xxx-5678
      return `xxx-xxx-${cleaned.slice(-4)}`;
    } else if (cleaned.length === 13) {
      // ID: 1234567890123 -> xxx-xxx-xxx-0123
      return `xxx-xxx-xxx-${cleaned.slice(-4)}`;
    }
    return id;
  };

  /**
   * Handles form submission to generate QR code
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrData(null);

    try {
      const requestBody: {
        amount?: number;
        message?: string;
      } = {};

      // Validate and include amount if provided
      if (amount.trim() !== "") {
        const amountNum = parseFloat(amount.trim());
        if (isNaN(amountNum) || amountNum < 0) {
          setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
          setLoading(false);
          return;
        }
        requestBody.amount = amountNum;
      }

      if (message.trim()) {
        requestBody.message = message.trim();
      }

      // Call the API endpoint
      const response = await fetch("/api/promptpay-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: PromptPayQrResponse = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "เกิดข้อผิดพลาดในการสร้าง QR Code");
      } else {
        setQrData(data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 space-y-4 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        บริจาคผ่าน PromptPay
      </h2>

      {/* Form */}
      {!qrData && (
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              จำนวนเงิน (บาท) <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Message Input */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ข้อความ (ไม่บังคับ)
            </label>
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="เช่น บริจาคเพื่อสนับสนุน"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังสร้าง QR Code..." : "สร้าง QR Code"}
          </button>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* QR Code Display */}
      {qrData && qrData.qrDataUrl && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* QR Code Image */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img
                src={qrData.qrDataUrl}
                alt="PromptPay QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* Info Display */}
          <div className="text-center space-y-2">
            {propPromptpayId && (
              <div>
                <p className="text-sm text-gray-600">PromptPay ID</p>
                <p className="text-lg font-semibold text-gray-900">
                  {maskPromptPayId(propPromptpayId)}
                </p>
              </div>
            )}
            {amount && parseFloat(amount) > 0 && (
              <div>
                <p className="text-sm text-gray-600">จำนวนเงิน</p>
                <p className="text-lg font-semibold text-gray-900">
                  {parseFloat(amount).toFixed(2)} THB
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              วิธีใช้งาน:
            </p>
            <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
              <li>เปิดแอปธนาคารของคุณ</li>
              <li>เลือกเมนู "สแกน QR" หรือ "PromptPay"</li>
              <li>สแกน QR Code นี้</li>
              <li>ยืนยันการโอนเงิน</li>
            </ol>
          </div>

          {/* Generate New Button */}
          <button
            onClick={() => {
              setQrData(null);
              setError(null);
              setAmount("");
              setMessage("");
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            สร้าง QR Code ใหม่
          </button>
        </div>
      )}
    </div>
  );
}

