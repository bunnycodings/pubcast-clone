"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { id: string; username: string; phoneNumber: string }) => void;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: RegistrationModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        setLoading(false);
        return;
      }

      // Set user in cookies for session
      document.cookie = `user_id=${data.user.id}; path=/; max-age=31536000`; // 1 year
      document.cookie = `username=${data.user.username}; path=/; max-age=31536000`;
      document.cookie = `phone_number=${data.user.phoneNumber}; path=/; max-age=31536000`;

      // Update global auth state (async, but don't wait for it)
      login(data.user).catch(err => {
        console.error('Error refreshing user after registration:', err);
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.user);
      }

      // Reset form and close
      setUsername("");
      setPhoneNumber("");
      setError(null);
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-purple-500/30">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">สมัครสมาชิก</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              ชื่อบัญชี (username) <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              className="w-full px-4 py-3 bg-[#0f0f12] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              3-20 ตัวอักษร ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              เบอร์โทรศัพท์ (Phone Number) <span className="text-red-500">*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0812345678"
              required
              pattern="0[0-9]{9}"
              maxLength={10}
              className="w-full px-4 py-3 bg-[#0f0f12] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              10 หลัก ขึ้นต้นด้วย 0 (เช่น 0812345678)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              "สมัครสมาชิก"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

