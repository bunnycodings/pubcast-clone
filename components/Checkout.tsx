"use client";

import { useState } from "react";
import { Loader2, CreditCard, Wallet, Building2 } from "lucide-react";

interface CheckoutProps {
  orderId: string;
  amount: number;
}

type PaymentMethod = "creditcard" | "promptpay" | "bank";

export default function Checkout({ orderId, amount }: CheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("promptpay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOtherPaymentMethods = (method: PaymentMethod) => {
    // Placeholder for other payment methods
    console.log(`Processing ${method} payment for order ${orderId}`);
    // Replace with your existing payment logic
  };

  const handlePay = async () => {
    setError(null);
    // Keep existing behavior for all payment methods
    handleOtherPaymentMethods(selectedMethod);
  };

  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: "creditcard",
      label: "Credit Card",
      icon: <CreditCard className="w-5 h-5" />,
      description: "ชำระด้วยบัตรเครดิต",
    },
    {
      id: "promptpay",
      label: "PromptPay",
      icon: <Wallet className="w-5 h-5" />,
      description: "ชำระผ่าน QR Code",
    },
    {
      id: "bank",
      label: "Bank Transfer",
      icon: <Building2 className="w-5 h-5" />,
      description: "โอนเงินผ่านธนาคาร",
    },
  ];

  return (
    <div className="bg-[#1a1a2e] rounded-2xl border border-purple-500/30 p-6 space-y-6 max-w-md w-full">
      {/* Order Summary */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">สรุปคำสั่งซื้อ</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>รหัสคำสั่งซื้อ:</span>
            <span className="font-mono text-white">{orderId}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>จำนวนเงิน:</span>
            <span className="font-bold text-white text-lg">
              {amount.toFixed(2)} THB
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          เลือกวิธีการชำระเงิน
        </h3>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) =>
                  setSelectedMethod(e.target.value as PaymentMethod)
                }
                className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2"
              />
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedMethod === method.id
                      ? "bg-purple-600"
                      : "bg-gray-700"
                  }`}
                >
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{method.label}</div>
                  <div className="text-xs text-gray-400">
                    {method.description}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Pay Now Button */}
      <button
        onClick={handlePay}
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังดำเนินการ...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </div>
  );
}
