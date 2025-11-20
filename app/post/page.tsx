"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, Send, X, Upload, AlertTriangle, Instagram, Facebook, Music2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { providerInfo, captionCategories } from "../data";
import Image from "next/image";
import PromptPayPaymentModal from "@/components/PromptPayPaymentModal";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

function PostPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>("image");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("instagram");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTextWithImage, setShowTextWithImage] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuthRequiredPopup, setShowAuthRequiredPopup] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Don't automatically show auth popup on mount - only show when user tries to do something

  // Fetch services from API
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.services && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
        setServicesLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch services:", err);
        setServicesLoading(false);
      });
  }, []);

  // Get service from URL parameter
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, [searchParams]);

  // Reset payment state when component mounts or step changes
  useEffect(() => {
    if (currentStep !== 3) {
      setShowPaymentModal(false);
      setPaymentCompleted(false);
    }
  }, [currentStep]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentService = services.find(s => s.id === selectedService);
  const isMessageService = selectedService === "message";

  if (servicesLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5 items-center justify-center">
          <p className="text-gray-400">กำลังโหลด...</p>
        </div>
      </main>
    );
  }

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, gradient: "from-purple-600 via-pink-500 to-orange-500" },
    { id: "facebook", name: "Facebook", icon: Facebook, gradient: "from-blue-600 to-blue-700" },
    { id: "twitter", name: "X", icon: MessageSquare, gradient: "from-gray-800 to-gray-900" },
    { id: "tiktok", name: "TikTok", icon: Music2, gradient: "from-gray-800 to-gray-900" },
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
    // Check if user is logged in
    if (!loading && !user) {
      setShowAuthRequiredPopup(true);
      return;
    }
    // If still loading, allow the action (user might be logged in)
    setSelectedVariant(variant);
    setCurrentStep(2);
  };

  const handleSelectMessage = (msg: string) => {
    setMessage(msg);
    setShowMessageModal(false);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Check if user is logged in
      if (!loading && !user) {
        setShowAuthRequiredPopup(true);
        return;
      }
      
      // For message service, only require message and username
      if (isMessageService) {
        if (!message.trim()) {
          alert("กรุณาใส่ข้อความ");
          return;
        }
        if (!username.trim()) {
          alert("กรุณาใส่ชื่อวาร์ปของคุณ");
          return;
        }
      } else {
        // For image/video service, require image
        if (!selectedImage) {
          alert("กรุณาอัพโหลดรูปภาพ");
          return;
        }
        if (!username.trim()) {
          alert("กรุณาใส่ชื่อวาร์ปของคุณ");
          return;
        }
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleSend = () => {
    if (!selectedVariant) return;
    
    // Check if user is logged in
    if (!loading && !user) {
      setShowAuthRequiredPopup(true);
      return;
    }
    
    // For message service, check message instead of image
    if (isMessageService) {
      if (!message.trim()) return;
    } else {
      if (!selectedImage) return;
    }
    
    // Show PromptPay payment modal directly
    setShowPaymentModal(true);
  };

  const handleLoginSuccess = (userData: { id: string; username: string; phoneNumber: string }) => {
    login(userData);
    setShowLoginModal(false);
    setShowAuthRequiredPopup(false);
  };

  const handlePaymentComplete = async () => {
    if (!selectedVariant) return;
    
    // For message service, check message instead of image
    if (isMessageService) {
      if (!message.trim()) return;
    } else {
      if (!selectedImage) return;
    }

    const payload = {
      id: Date.now(),
      type: isMessageService ? "message" : "image",
      user: username || "Guest User",
      platform: selectedPlatform,
      message: isMessageService ? message : (showTextWithImage && message ? message : ""),
      mediaUrl: selectedImage || null,
      showText: isMessageService ? true : showTextWithImage,
      duration: selectedVariant.duration * 1000
    };

    const channel = new BroadcastChannel('pubcast_channel');
    channel.postMessage(payload);
    channel.close();
    
    // LINE notification is now handled in PromptPayPaymentModal before payment completion
    
    // Reset form and redirect
    setMessage("");
    handleRemoveImage();
    setShowTextWithImage(true);
    setSelectedPlatform("instagram");
    setUsername("");
    setCurrentStep(1);
    setSelectedVariant(null);
    setShowPaymentModal(false);
    setPaymentCompleted(false);
    
    // Redirect immediately
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>

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
                {currentService?.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant)}
                    className="bg-gradient-to-br from-orange-900/50 to-purple-900/50 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform"
                  >
                    {currentService.thumbnail ? (
                      <img 
                        src={currentService.thumbnail} 
                        alt="Icon" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8"
                      />
                    ) : (
                      <MessageSquare className="w-8 h-8 text-white" />
                    )}
                    <div className="text-center">
                      <p className="font-bold text-lg">{variant.name}</p>
                      <p className="text-sm text-white/70">{variant.price} บาท</p>
                    </div>
                    <div className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium text-center">
                      เลือก
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Upload & Details */}
          {currentStep === 2 && (
            <>
              {/* Warning Text - Only show for image service */}
              {!isMessageService && (
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
              )}

              {/* Image Upload - Only show for image/video service */}
              {!isMessageService && (
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
              )}

              {/* Social Media Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">ชื่อวาร์ปของคุณ</h3>
                <div className="flex gap-3 mb-3">
                  {platforms.map((platform) => {
                    const getPlatformIcon = () => {
                      switch(platform.id) {
                        case 'instagram':
                          return <img src="https://m.pubcastplus.com/images/social/instagram.svg" alt="Instagram" width={24} height={24} className="w-6 h-6" loading="lazy" />;
                        case 'facebook':
                          return <img src="https://m.pubcastplus.com/images/social/facebook.svg" alt="Facebook" width={24} height={24} className="w-6 h-6" loading="lazy" />;
                        case 'twitter':
                          return <img src="https://m.pubcastplus.com/images/social/twitter.png" alt="Twitter" width={24} height={24} className="w-6 h-6" loading="lazy" />;
                        case 'tiktok':
                          return <img src="https://m.pubcastplus.com/images/social/tiktok.svg?v=4" alt="TikTok" width={24} height={24} className="w-6 h-6" loading="lazy" />;
                        default:
                          return null;
                      }
                    };
                    
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
                        {getPlatformIcon()}
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
                <h3 className="text-lg font-bold mb-3">
                  {isMessageService ? "ข้อความที่ต้องการส่ง" : "เลือกข้อความ"}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isMessageService ? "พิมพ์ข้อความที่ต้องการส่งขึ้นจอ" : "เลือกข้อความ"}
                    className="flex-1 bg-[#1a1a20] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required={isMessageService}
                  />
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="px-6 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                  >
                    เลือก
                  </button>
                </div>
                {isMessageService && (
                  <p className="mt-2 text-xs text-gray-400">
                    คุณสามารถพิมพ์ข้อความเองหรือเลือกจากรายการ
                  </p>
                )}
              </div>

              {/* Show Text with Image Option - Only for image service */}
              {!isMessageService && selectedImage && (
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
                
                {!isMessageService && selectedImage && (
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

              {/* Payment Status */}
              {paymentCompleted && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-green-400">ชำระเงินสำเร็จแล้ว</p>
                      <p className="text-sm text-gray-300">ระบบกำลังดำเนินการส่งรูปขึ้นจอ...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        {(
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

        {/* PromptPay Payment Modal */}
        {selectedVariant && (
          <PromptPayPaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
            }}
            amount={selectedVariant.price}
            username={username}
            serviceType={isMessageService ? "message" : "image"}
            onPaymentComplete={() => {
              setPaymentCompleted(true);
              handlePaymentComplete();
            }}
          />
        )}

        {/* Authentication Required Popup */}
        {showAuthRequiredPopup && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-[#1a1a2e] rounded-2xl max-w-sm w-full border border-purple-500/30 p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    ต้องเข้าสู่ระบบ
                  </h3>
                  <p className="text-gray-300 text-sm">
                    กรุณาเข้าสู่ระบบหรือสมัครสมาชิก
                    <br />
                    เพื่อใช้งานบริการ
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAuthRequiredPopup(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthRequiredPopup(false);
                      setShowLoginModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-xl hover:brightness-110 transition-all"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />

      </div>
    </main>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5 items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400">กำลังโหลด...</p>
          </div>
        </div>
      </main>
    }>
      <PostPageContent />
    </Suspense>
  );
}
