"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, Send, X, CheckCircle2, Upload, AlertTriangle, Instagram, Facebook, Music2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { providerInfo, services, captionCategories } from "../data";
import Image from "next/image";

export default function PostPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("instagram");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [showTextWithImage, setShowTextWithImage] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const imageService = services.find(s => s.id === "image");

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, gradient: "from-purple-600 via-pink-500 to-orange-500" },
    { id: "facebook", name: "Facebook", icon: Facebook, gradient: "from-blue-600 to-blue-700" },
    { id: "twitter", name: "X", icon: Twitter, gradient: "from-gray-800 to-gray-900" },
    { id: "tiktok", name: "TikTok", icon: Music2, gradient: "from-gray-800 to-gray-900" },
    { id: "guest", name: "Guest", icon: MessageSquare, gradient: "from-gray-600 to-gray-700" },
  ];

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

  const handleSelectVariant = (variant: any) => {
    setSelectedVariant(variant);
    setCurrentStep(2);
  };

  const handleSelectMessage = (msg: string) => {
    setMessage(msg);
    setShowMessageModal(false);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!selectedImage) {
        alert("กรุณาอัพโหลดรูปภาพ");
        return;
      }
      if (!username.trim()) {
        alert("กรุณาใส่ชื่อวาร์ปของคุณ");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle countdown and auto-close
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [showSuccess, countdown, router]);

  const handleSend = () => {
    if (!selectedImage || !selectedVariant) return;

    const payload = {
      id: Date.now(),
      type: "image",
      user: username || "Guest User",
      platform: selectedPlatform,
      message: showTextWithImage && message ? message : "",
      mediaUrl: selectedImage,
      showText: showTextWithImage,
      duration: selectedVariant.duration * 1000
    };

    const channel = new BroadcastChannel('pubcast_channel');
    channel.postMessage(payload);
    channel.close();
    
    setShowSuccess(true);
    setCountdown(20);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>

        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#0f0f12] border border-purple-500/30 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ส่งข้อความเรียบร้อยแล้ว!</h2>
              <p className="text-gray-400 mb-6">หน้าต่างจะปิดอัตโนมัติใน</p>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
                {countdown}
              </div>
              <p className="text-sm text-gray-500">วินาที</p>
            </div>
          </div>
        )}

        {/* Warning Modal */}
        {showWarningModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">ห้ามใช้รูปภาพดังต่อไปนี้</h3>
                </div>
                <button onClick={() => setShowWarningModal(false)} className="text-white hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 text-gray-800 text-sm space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>รูปภาพโฆษณาที่ผิดกฎหมาย เช่น การพนัน สินค้าแอลกอฮอล์ การชักชวนลงทุน ยาเสพติด สินค้าผิดกฎหมาย</li>
                  <li>รูปภาพที่มีเนื้อหาไม่เหมาะสมหรือลามก</li>
                  <li>รูปภาพที่ใช้แสดงความคิดเห็นหรือจุดยืนที่ละเมิดสิทธิหรือเสรีภาพของผู้อื่น</li>
                  <li>รูปภาพที่กระทำผิดกฎหมายหรือการคุกคาม</li>
                  <li>รูปภาพที่อาจก่อให้เกิดความขัดแย้ง ความรุนแรง ความแตกแยก หรือการดูหมิ่น</li>
                  <li>รูปภาพที่มี QR Code หรือลิงก์เป็นส่วนประกอบ</li>
                </ul>
                <p className="text-red-600 text-xs mt-4">
                  * ในกรณีที่มีการใช้ภาพที่ไม่เหมาะสมในเนื้อหาหรือการโฆษณา ทางผู้ให้บริการอาจปฏิเสธการให้บริการและไม่สามารถดำเนินการคืนเงินได้
                </p>
              </div>
              <div className="p-4 border-t">
                <button 
                  onClick={() => setShowWarningModal(false)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Selection Modal */}
        {showMessageModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold">เลือกข้อความ</h3>
                <button onClick={() => setShowMessageModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {captionCategories.map((category, idx) => (
                  <div key={idx} className="border-b border-white/10 pb-2">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.title ? null : category.title)}
                      className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <span className="font-medium">{category.title}</span>
                      {expandedCategory === category.title ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedCategory === category.title && (
                      <div className="mt-2 space-y-1">
                        {category.messages.map((msg, msgIdx) => (
                          <div key={msgIdx} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg">
                            <span className="text-sm flex-1">{msg}</span>
                            <button
                              onClick={() => handleSelectMessage(msg)}
                              className="px-3 py-1 bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              เลือก
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative p-4 flex items-center justify-between z-10">
          <Link href="/" className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {currentStep === 1 ? "ส่งรูปขึ้นจอ" : currentStep === 2 ? "ส่งรูปขึ้นจอ" : "ส่งรูปขึ้นจอ"}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= step 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col relative z-10 overflow-y-auto">
          
          {/* Step 1: Select Options */}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-bold mb-4">ระบุตัวเลือก</h2>
              <div className="grid grid-cols-2 gap-4">
                {imageService?.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant)}
                    className="bg-gradient-to-br from-orange-900/50 to-purple-900/50 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform"
                  >
                    <ImageIcon className="w-8 h-8 text-white/80" />
                    <div className="text-center">
                      <p className="font-bold text-lg">{variant.name}</p>
                      <p className="text-sm text-white/70">{variant.price} บาท</p>
                    </div>
                    <button className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      เลือก
                    </button>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Upload & Details */}
          {currentStep === 2 && (
            <>
              {/* Warning Text */}
              <div className="mb-4 text-xs text-gray-400 space-y-1">
                <p>
                  ห้ามโพสต์เนื้อหาโฆษณา หากต้องการลงโฆษณาติดต่อ{" "}
                  <button className="text-purple-400 hover:underline">PubCast Ads</button>
                </p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <button 
                    onClick={() => setShowWarningModal(true)}
                    className="text-yellow-400 hover:underline"
                  >
                    ข้อจำกัดรูปภาพ
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                {selectedImage ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10">
                    <Image 
                      src={selectedImage} 
                      alt="Preview" 
                      fill 
                      className="object-cover" 
                      unoptimized
                    />
                    <button 
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={handleImageClick}
                    className="w-full h-64 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-500/50 transition-colors bg-white/5"
                  >
                    <Upload className="w-12 h-12 text-white/50" />
                    <p className="text-white/70">กดที่นี่ เพื่ออัพโหลดรูปภาพ</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Social Media Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">ชื่อวาร์ปของคุณ</h3>
                <div className="flex gap-3 mb-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                          selectedPlatform === platform.id
                            ? `bg-gradient-to-br ${platform.gradient} border-2 border-teal-400 scale-110`
                            : 'bg-gray-700 border-2 border-transparent'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรุณาใส่ชื่อไอจีของคุณ"
                  className="w-full bg-[#1a1a20] border border-purple-500/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Message Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">เลือกข้อความ</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="เลือกข้อความ"
                    className="flex-1 bg-[#1a1a20] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="px-6 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                  >
                    เลือก
                  </button>
                </div>
              </div>

              {/* Show Text with Image Option */}
              {selectedImage && (
                <div className="mb-6 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTextWithImage}
                      onChange={(e) => setShowTextWithImage(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-300">แสดงข้อความบนรูปภาพ</span>
                  </label>
                </div>
              )}
            </>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">ตรวจสอบข้อมูล</h2>
              
              <div className="bg-white/5 rounded-xl p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">ระยะเวลา</p>
                  <p className="font-bold">{selectedVariant?.name} - {selectedVariant?.price} บาท</p>
                </div>
                
                {selectedImage && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">รูปภาพ</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image src={selectedImage} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">ชื่อวาร์ป</p>
                  <p className="font-bold">{username}</p>
                </div>
                
                {message && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">ข้อความ</p>
                    <p className="font-bold">{message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        {!showSuccess && (
          <div className="p-6 border-t border-white/10 flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                กลับไปตัวเลือก
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={currentStep === 2 ? handleNext : undefined}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                ดำเนินการต่อ
              </button>
            ) : (
              <button
                onClick={handleSend}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                ส่งขึ้นจอ
              </button>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
