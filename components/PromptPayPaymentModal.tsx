"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

interface PromptPayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete: () => void;
  username?: string;
  serviceType?: "message" | "image";
}

interface ApiResponse {
  payload?: string;
  qrDataUrl?: string;
  error?: string;
}

export default function PromptPayPaymentModal({
  isOpen,
  onClose,
  amount,
  onPaymentComplete,
  username,
  serviceType,
}: PromptPayPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [isPaymentError, setIsPaymentError] = useState(false);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && amount > 0 && !qrData && !paymentConfirmed) {
      generateQR();
    }
    // Reset when modal closes
    if (!isOpen) {
      setQrData(null);
      setError(null);
      setPaymentConfirmed(false);
      setLoading(false);
      setVerifyingPayment(false);
      setIsPaymentError(false);
    }
  }, [isOpen, amount]);

  const generateQR = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/promptpay-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
        }),
      });

      const data: ApiResponse = await response.json();

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

  const handlePaymentComplete = async () => {
    setVerifyingPayment(true);
    setError(null);

    try {
      // Send LINE Notify notification to verify payment
      const notifyMessage = `💰 การชำระเงินสำเร็จ!\n\n` +
        `ผู้ใช้: ${username || "Guest User"}\n` +
        `ประเภท: ${serviceType === "message" ? "ข้อความ" : "รูปภาพ"}\n` +
        `จำนวนเงิน: ${amount} บาท`;

      const response = await fetch('/api/line-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: notifyMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'ไม่สามารถส่งการแจ้งเตือน LINE ได้ กรุณาติดต่อ @pubcastplus');
        setIsPaymentError(true);
        setVerifyingPayment(false);
        return;
      }

      // If notification was sent successfully, proceed with payment completion
    setPaymentConfirmed(true);
      setVerifyingPayment(false);
    // Call the callback after a short delay to show confirmation
    setTimeout(() => {
      onPaymentComplete();
    }, 2000);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน กรุณาติดต่อ @pubcastplus');
      setIsPaymentError(true);
      setVerifyingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">ชำระเงิน</h2>
          {!paymentConfirmed && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {paymentConfirmed ? (
            /* Payment Confirmed */
            <div className="text-center space-y-4 py-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  ชำระเงินสำเร็จ!
                </h3>
                <p className="text-gray-300">
                  ขอบคุณสำหรับการชำระเงิน ระบบกำลังดำเนินการต่อ...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* QR Title Image */}
              <div className="flex justify-center">
                <img 
                  src="https://m.pubcastplus.com/images/qr-title.png" 
                  alt="QR Title" 
                  className="max-w-full h-auto"
                  onError={(e) => {
                    console.error("Failed to load QR title image");
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Amount Display */}
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">จำนวนเงินที่ต้องชำระ</p>
                <p className="text-3xl font-bold text-white">{amount.toFixed(2)} THB</p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  <p className="text-gray-300">กำลังสร้าง QR Code...</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                  {isPaymentError ? (
                    <button
                      onClick={() => {
                        setError(null);
                        setIsPaymentError(false);
                      }}
                      className="mt-2 text-red-300 text-sm hover:underline"
                    >
                      ปิด
                    </button>
                  ) : (
                  <button
                    onClick={generateQR}
                    className="mt-2 text-red-300 text-sm hover:underline"
                  >
                    ลองอีกครั้ง
                  </button>
                  )}
                </div>
              )}

              {/* QR Code Display */}
              {qrData && qrData.qrDataUrl && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-purple-500/50">
                      <img
                        src={qrData.qrDataUrl}
                        alt="PromptPay QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-sm text-purple-300 font-medium mb-2">
                      วิธีชำระเงิน:
                    </p>
                    <ol className="text-xs text-gray-300 list-decimal list-inside space-y-1">
                      <li>เปิดแอปธนาคารของคุณ</li>
                      <li>เลือกเมนู "สแกน QR" หรือ "PromptPay"</li>
                      <li>สแกน QR Code นี้</li>
                      <li>ยืนยันการโอนเงิน</li>
                      <li>กดปุ่ม "ยืนยันการชำระเงิน" ด้านล่างหลังจากโอนเงินเสร็จ</li>
                    </ol>
                  </div>

                  {/* Payment Title */}
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">ชำระเงินผ่านพร้อมเพย์</p>
                  </div>

                  {/* Payment Complete Button */}
                  <button
                    onClick={handlePaymentComplete}
                    disabled={verifyingPayment}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    {verifyingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      <>
                    <CheckCircle2 className="w-5 h-5" />
                    จ่ายเงินแล้ว คลิ๊กที่นี่
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

