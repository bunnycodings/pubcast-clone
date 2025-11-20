"use client";

import { useState } from "react";
import type { PromptPayQrSuccessResponse, PromptPayQrErrorResponse } from "@/types/api";

interface PromptPayDonateButtonProps {
  promptpayId: string;
  defaultAmount?: number;
  label?: string;
}

export default function PromptPayDonateButton({
  promptpayId,
  defaultAmount,
  label = "Donate via PromptPay",
}: PromptPayDonateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>(
    defaultAmount ? defaultAmount.toString() : ""
  );
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<PromptPayQrSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQrData(null);

    try {
      const requestBody = {
        promptpayId,
        amount: amount ? parseFloat(amount) : null,
        description: description || null,
      };

      const response = await fetch("/api/promptpay-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || "error" in data) {
        const errorData = data as PromptPayQrErrorResponse;
        setError(errorData.error.message);
        return;
      }

      setQrData(data as PromptPayQrSuccessResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Donate Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        {label}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                PromptPay Donation
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setQrData(null);
                  setError(null);
                  setAmount(defaultAmount ? defaultAmount.toString() : "");
                  setDescription("");
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Form */}
              {!qrData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (THB)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Donation for stream"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {loading ? "Generating QR..." : "Generate QR Code"}
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* QR Code Display */}
              {qrData && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <img
                        src={qrData.qrDataUrl}
                        alt="PromptPay QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your banking app
                    </p>
                    {amount && (
                      <p className="text-lg font-semibold text-gray-900">
                        Amount: {parseFloat(amount).toFixed(2)} THB
                      </p>
                    )}
                  </div>

                  {qrData.expiresAt && (
                    <p className="text-xs text-gray-500 text-center">
                      Valid until: {new Date(qrData.expiresAt).toLocaleString()}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setQrData(null);
                      setError(null);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Generate New QR
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

