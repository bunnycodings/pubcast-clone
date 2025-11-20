"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { providerInfo } from "./data";
import {  Home, Flame, Plus, MessageCircle, User, Clock, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function MainPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, login } = useAuth();
  const [promoText, setPromoText] = useState("");
  const [promoSubtext, setPromoSubtext] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch settings (services and promo text) from API
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.promoText) setPromoText(data.promoText);
        if (data.promoSubtext) setPromoSubtext(data.promoSubtext);
        if (data.services && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch settings:", err);
        setLoading(false);
      });
  }, []);

  const handleLoginSuccess = (userData: { id: string; username: string; phoneNumber: string }) => {
    login(userData);
    setShowLoginModal(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-24 font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative overflow-hidden border-x border-white/5">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Area */}
      <div className="relative pt-4 pb-6 px-4 z-10">
        {/* Top Bar: Login & Language */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 opacity-80">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-medium tracking-wider text-green-400 uppercase">Live Now</span>
            </div>
            <div className="flex gap-3 items-center">
                {user ? (
                  <Link href="/profile" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all">
                    {user.username}
                  </Link>
                ) : (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all"
                  >
                    เข้าสู่ระบบ
                  </button>
                )}
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/20 shadow-sm">
                    <div className="h-full w-full flex flex-col">
                        <div className="h-[16%] bg-[#A51931]"></div>
                        <div className="h-[16%] bg-[#F4F5F8]"></div>
                        <div className="h-[36%] bg-[#2D2A4A]"></div>
                        <div className="h-[16%] bg-[#F4F5F8]"></div>
                        <div className="h-[16%] bg-[#A51931]"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Center Logo & Info */}
        <div className="flex flex-col items-center relative">
            {/* Logo Container with Glow */}
            <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37] to-purple-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                <div className="relative w-full h-full rounded-full border-[3px] border-[#D4AF37] p-1 bg-[#0f0f12] shadow-2xl">
                    <Image
                        src={providerInfo.logo}
                        alt={providerInfo.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="rounded-full object-cover w-full h-full"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> VIP
                </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-1">
                {providerInfo.name}
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {providerInfo.location.province}, {providerInfo.location.country}
            </p>
        </div>
      </div>

      <div className="px-4 space-y-5 relative z-10 pb-10">
        {/* Promo Banner */}
        <div className="group relative w-full h-24 rounded-2xl overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 transition-transform duration-500 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            <div className="relative h-full flex items-center px-5 justify-between">
                <div className="flex-1 z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20">PROMO</span>
                    </div>
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">{promoText}</h2>
                    <p className="text-xs text-white/90 font-medium">{promoSubtext}</p>
                </div>
                
                <div className="relative">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600 font-black text-sm">FREE</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
            </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                บริการ <span className="text-purple-500">.</span>
            </h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Services</span>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, idx) => (
            <button
              onClick={() => {
                if (!user) {
                  setShowLoginModal(true);
                } else {
                  window.location.href = `/post?service=${service.id}`;
                }
              }}
              key={service.id}
              className={cn(
                "group relative h-32 rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/5",
                idx === 0 ? "bg-gradient-to-br from-blue-900/40 to-purple-900/40 hover:border-blue-500/50" : 
                idx === 1 ? "bg-gradient-to-br from-purple-900/40 to-pink-900/40 hover:border-purple-500/50" : 
                idx === 2 ? "bg-gradient-to-br from-indigo-900/40 to-violet-900/40 col-span-2 aspect-[2.5/1] h-auto hover:border-indigo-500/50" : 
                idx === 3 ? "bg-gradient-to-br from-cyan-900/40 to-blue-900/40 hover:border-cyan-500/50" : 
                "bg-gradient-to-br from-pink-900/40 to-rose-900/40 hover:border-pink-500/50"
              )}
            >
                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Dynamic Glow */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-300"></div>

                {/* NEW Badge */}
                {(service as any).isNew && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-20">
                        <Clock className="w-3 h-3" /> NEW
                    </div>
                )}

                <div className="relative h-full flex flex-col justify-between z-10">
                    <div className="flex-1 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                         {service.thumbnail ? (
                             <div className="relative w-14 h-14 drop-shadow-2xl filter contrast-125">
                                <Image 
                                    src={service.thumbnail} 
                                    alt={service.name}
                                    fill
                                    unoptimized
                                    className="object-contain"
                                    sizes="(max-width: 768px) 25vw, 15vw"
                                />
                             </div>
                         ) : (
                            <div className="text-4xl filter drop-shadow-lg">
                                {service.id === 'repost' && '🔁'}
                                {service.id === 'duet' && '👥'}
                            </div>
                         )}
                    </div>
                    <div className="mt-2">
                         <span className="text-sm font-bold text-white group-hover:text-white/100 transition-colors block text-center truncate">
                            {service.name}
                        </span>
                        <div className="h-0.5 w-8 bg-white/20 mx-auto mt-2 rounded-full group-hover:w-16 group-hover:bg-white/50 transition-all duration-300"></div>
                    </div>
                </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[440px] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex justify-between items-center z-50 shadow-2xl shadow-black/50">
            <Link href="/explore" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white hover:scale-110 transition-all duration-200">
                <Home className="w-5 h-5" />
            </Link>
            <Link href="/dating" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white hover:scale-110 transition-all duration-200">
                <Flame className="w-5 h-5" />
            </Link>
            
            <Link href="/post" className="relative -top-6">
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 border-[4px] border-[#0f0f12] hover:scale-105 transition-transform duration-200 active:scale-95">
                    <Plus className="w-7 h-7 text-white" />
                </div>
            </Link>

            <Link href="/chat" className="flex flex-col items-center gap-1 text-gray-400 relative hover:text-white hover:scale-110 transition-all duration-200">
                <div className="relative">
                    <MessageCircle className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#1a1a1a]">1</span>
                </div>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white hover:scale-110 transition-all duration-200">
                <User className="w-5 h-5" />
            </Link>
      </div>

      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </main>
  );
}
