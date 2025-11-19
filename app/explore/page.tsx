"use client";

import Link from "next/link";
import { ChevronLeft, Construction } from "lucide-react";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex justify-center bg-[#121212]">
      <div className="w-full max-w-[480px] min-h-screen bg-black shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center border-b border-white/10">
            <Link href="/" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="ml-2 text-lg font-bold">ส่องวาร์ป (Explore)</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <Construction className="w-16 h-16 mb-4 text-purple-500" />
            <h2 className="text-xl font-bold text-white mb-2">กำลังพัฒนา</h2>
            <p>ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</p>
        </div>

      </div>
    </main>
  );
}

