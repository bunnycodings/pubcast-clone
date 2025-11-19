"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Image as ImageIcon, Send, X, Sparkles } from "lucide-react";
import { providerInfo } from "../data";
import Image from "next/image";

export default function PostPage() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    setIsSending(true);

    // Create payload
    const payload = {
        id: Date.now(),
        type: selectedImage ? "image" : "text",
        user: "Guest User", // In a real app, this would come from auth
        platform: "guest",
        message: message,
        mediaUrl: selectedImage, // Pass the base64 image string
        duration: 10000
    };

    // Send via BroadcastChannel
    const channel = new BroadcastChannel('pubcast_channel');
    channel.postMessage(payload);
    channel.close();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setMessage("");
    handleRemoveImage();
    setIsSending(false);
    alert("ส่งข้อความเรียบร้อยแล้ว!");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="relative p-4 flex items-center justify-between z-10">
            <Link href="/" className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                ส่งข้อความขึ้นจอ
            </h1>
            <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col relative z-10">
            
            {/* Venue Info Card */}
            <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/50 p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <Image
                        src={providerInfo.logo}
                        alt={providerInfo.name}
                        width={56}
                        height={56}
                        unoptimized
                        className="rounded-full object-cover w-full h-full"
                    />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white">{providerInfo.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-xs text-green-400 font-medium">ออนไลน์</p>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-[#1a1a20] rounded-3xl p-1 border border-white/10 shadow-inner mb-6 group focus-within:border-purple-500/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300">
                <div className="bg-[#0f0f12] rounded-[20px] p-4 min-h-[180px] relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="พิมพ์ข้อความของคุณที่นี่..."
                        className="w-full bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none text-lg leading-relaxed"
                        rows={4}
                        maxLength={100}
                    />
                    
                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="relative w-full h-48 mt-4 rounded-xl overflow-hidden border border-white/10 group/preview">
                            <Image 
                                src={selectedImage} 
                                alt="Preview" 
                                fill 
                                className="object-cover" 
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity"></div>
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-red-500 transition-all transform hover:scale-110"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-600">
                        <span className={`${message.length > 90 ? 'text-yellow-500' : ''}`}>
                            {message.length}
                        </span>
                        /100
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <button 
                        onClick={handleImageClick}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 ${
                            selectedImage 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                            : 'bg-[#1A1A2E] border-white/10 text-gray-400 hover:text-purple-400 hover:border-purple-500/30'
                        }`}
                    >
                        <ImageIcon className="w-5 h-5" />
                        {selectedImage && <span className="text-xs font-bold">รูปภาพ 1</span>}
                    </button>
                    {/* Placeholder for future feature */}
                    <button className="p-3.5 rounded-2xl bg-[#1A1A2E] border border-white/10 text-gray-600 cursor-not-allowed opacity-50">
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Send Button */}
            <button 
                onClick={handleSend}
                disabled={(!message.trim() && !selectedImage) || isSending}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group hover:brightness-110"
            >
                {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <Send className="w-5 h-5 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-lg">ส่งขึ้นจอ</span>
                    </>
                )}
            </button>

        </div>

      </div>
    </main>
  );
}
