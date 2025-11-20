"use client";

import { useState } from "react";
import { X, CreditCard, Wallet, Smartphone, Globe, ShoppingBag } from "lucide-react";

export type PaymentMethodType = "promptpay" | "truemoneywallet" | "shopeepay" | "linepay" | "internetbanking";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethodType) => void;
  amount: number;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onSelectMethod,
  amount,
}: PaymentMethodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-purple-500/30">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">เลือกวิธีการชำระเงิน</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount Display */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-1">จำนวนเงินที่ต้องชำระ</p>
            <p className="text-3xl font-bold text-white">{amount.toFixed(2)} THB</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* PromptPay Option */}
            <button
              onClick={() => {
                onSelectMethod("promptpay");
                onClose();
              }}
              className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-xl p-4 hover:border-purple-500 hover:bg-purple-600/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-white">พร้อมเพย์</h3>
                <p className="text-sm text-gray-400">ชำระผ่าน QR Code</p>
              </div>
              <div className="text-purple-400 group-hover:text-purple-300">
                →
              </div>
            </button>

            {/* TrueMoney Wallet Option */}
            <button
              onClick={() => {
                onSelectMethod("truemoneywallet");
                onClose();
              }}
              className="w-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/50 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-600/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-white">TrueMoney Wallet</h3>
                <p className="text-sm text-gray-400">ชำระผ่าน TrueMoney</p>
              </div>
              <div className="text-blue-400 group-hover:text-blue-300">
                →
              </div>
            </button>

            {/* Shopee Pay Option */}
            <button
              onClick={() => {
                onSelectMethod("shopeepay");
                onClose();
              }}
              className="w-full bg-gradient-to-r from-orange-600/20 to-red-600/20 border-2 border-orange-500/50 rounded-xl p-4 hover:border-orange-500 hover:bg-orange-600/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-white">Shopee Pay</h3>
                <p className="text-sm text-gray-400">ชำระผ่าน Shopee Pay</p>
              </div>
              <div className="text-orange-400 group-hover:text-orange-300">
                →
              </div>
            </button>

            {/* LINE Pay Option */}
            <button
              onClick={() => {
                onSelectMethod("linepay");
                onClose();
              }}
              className="w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 rounded-xl p-4 hover:border-green-500 hover:bg-green-600/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-white">LINE Pay</h3>
                <p className="text-sm text-gray-400">ชำระผ่าน LINE Pay</p>
              </div>
              <div className="text-green-400 group-hover:text-green-300">
                →
              </div>
            </button>

            {/* Internet Banking Option */}
            <button
              onClick={() => {
                onSelectMethod("internetbanking");
                onClose();
              }}
              className="w-full bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border-2 border-indigo-500/50 rounded-xl p-4 hover:border-indigo-500 hover:bg-indigo-600/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-white">Internet Banking</h3>
                <p className="text-sm text-gray-400">ชำระผ่านธนาคารออนไลน์</p>
              </div>
              <div className="text-indigo-400 group-hover:text-indigo-300">
                →
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

