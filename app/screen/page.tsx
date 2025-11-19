"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Music, MessageSquare } from "lucide-react"; 
import { providerInfo } from "../data";

// Fallback queue in case no real data arrives
const DEFAULT_QUEUE = [
  {
    id: 1,
    type: "text",
    user: "System",
    platform: "system",
    message: "Waiting for messages...",
    mediaUrl: null,
    duration: 10000
  }
];

export default function ScreenPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Use a ref to track the queue and processing state to avoid stale closures
  const queueRef = useRef<any[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Display Logic - using useCallback to avoid stale closures
  const processNextItem = useCallback(async () => {
    if (queueRef.current.length === 0 || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    
    // Fade out
    setShow(false);
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for fade out

    // Get next item (FIFO)
    const next = queueRef.current[0];
    const rest = queueRef.current.slice(1);
    queueRef.current = rest;
    
    setQueue(rest);

    if (next) {
        setCurrentItem(next);
        
        // Fade in
        setShow(true);

        // Wait for duration (use item.duration or default to 20s)
        const duration = next.duration || 20000;
        displayTimeoutRef.current = setTimeout(() => {
            // Hide the content after duration
            setShow(false);
            isProcessingRef.current = false;
            
            // Wait a bit then process next item or keep black screen
            setTimeout(() => {
                if (queueRef.current.length > 0) {
                    processNextItem();
                } else {
                    // Keep screen black when queue is empty
                    setShow(false);
                }
            }, 500);
        }, duration);
    } else {
        isProcessingRef.current = false;
    }
  }, []);
  
  // Listen for Broadcast Channel messages (client-side only)
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;
    
    let channel: BroadcastChannel | null = null;
    
    try {
      channel = new BroadcastChannel('pubcast_channel');
      
      channel.onmessage = (event) => {
          console.log("Received message:", event.data);
          const newItem = event.data;
          
          // Add to queue
          setQueue(prev => {
              const newQueue = [...prev, newItem];
              queueRef.current = newQueue;
              
              // If not currently processing, start processing immediately
              if (!isProcessingRef.current) {
                  // Clear any existing timeout
                  if (displayTimeoutRef.current) {
                      clearTimeout(displayTimeoutRef.current);
                  }
                  // Start processing immediately
                  processNextItem();
              }
              
              return newQueue;
          });
      };
    } catch (error) {
      console.error("BroadcastChannel not supported:", error);
    }

    return () => {
        if (channel) {
            channel.close();
        }
        if (displayTimeoutRef.current) {
            clearTimeout(displayTimeoutRef.current);
        }
    };
  }, [processNextItem, isMounted]);

  // Determine Icon based on platform - use img tags for external URLs to avoid hydration issues
  const getIcon = (platform: string) => {
      if (!platform) return <Music className="w-12 h-12 text-white" />;
      
      switch(platform) {
          case 'instagram': 
              return <img src="https://m.pubcastplus.com/images/social/instagram.svg" alt="Instagram" width={48} height={48} className="w-12 h-12" />;
          case 'facebook': 
              return <img src="https://m.pubcastplus.com/images/social/facebook.svg" alt="Facebook" width={48} height={48} className="w-12 h-12" />;
          case 'twitter': 
              return <img src="https://m.pubcastplus.com/images/social/twitter.png" alt="Twitter" width={48} height={48} className="w-12 h-12" />;
          case 'tiktok': 
              return <img src="https://m.pubcastplus.com/images/social/tiktok.svg?v=4" alt="TikTok" width={48} height={48} className="w-12 h-12" />;
          case 'onlyfans':
              return <img src="https://m.pubcastplus.com/images/social/onlyfans.svg" alt="OnlyFans" width={48} height={48} className="w-12 h-12" />;
          case 'guest': 
              return <MessageSquare className="w-12 h-12 text-white" />;
          default: 
              return <Music className="w-12 h-12 text-white" />;
      }
  };

  // Determine display mode - don't show default/system messages
  const isDefaultMessage = currentItem?.platform === "system";
  const hasImage = currentItem?.mediaUrl;
  const hasMessage = currentItem?.message && currentItem.message.trim();
  const shouldShow = show && currentItem && !isDefaultMessage && (hasImage || hasMessage);

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans" suppressHydrationWarning>
      {/* Background Context - Only show when content is visible */}
      {shouldShow && (
        <div className="absolute inset-0 overflow-hidden">
           <Image
              src={providerInfo.logo}
              alt="Background"
              fill
              className="object-cover opacity-10 blur-xl"
              unoptimized
           />
        </div>
      )}
      
      {/* Main Content Container - Two Panel Layout */}
      {shouldShow && (
        <div className={`relative z-10 flex w-full max-w-7xl h-[80vh] transition-all duration-500 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Left Side: Image - Only show if image exists */}
        {hasImage && currentItem && (
          <div className="flex-1 bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-l-3xl overflow-hidden relative flex items-center justify-center">
              <div className="relative w-full h-full p-4">
                  <Image 
                      src={currentItem.mediaUrl} 
                      alt="User Content" 
                      fill 
                      className="object-contain rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                      unoptimized
                  />
              </div>
              
              {/* Corner Decoration */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-purple-500 rounded-tl-3xl z-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-blue-500 rounded-br-3xl z-20"></div>
          </div>
        )}

        {/* Right Side: Message - Only show if message exists */}
        {hasMessage && currentItem && (
          <div className={`${hasImage ? 'w-[40%]' : 'w-full'} bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-y-2 border-r-2 border-blue-500/30 ${hasImage ? 'rounded-r-3xl' : 'rounded-3xl'} flex flex-col relative overflow-hidden`}>
              
              {/* Platform Icon & User */}
              <div className="flex flex-col items-center justify-center pt-12 pb-6 z-10">
                  <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                      {getIcon(currentItem.platform)}
                  </div>
                  <h2 className="text-4xl font-bold drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                      {currentItem.user ? (typeof currentItem.user === 'string' ? currentItem.user.replace(/\d+\s*(วินาที|second|seconds)/gi, '').trim() : currentItem.user) : ''}
                  </h2>
              </div>

              {/* Message Area */}
              <div className="flex-1 px-8 flex items-center justify-center z-10 overflow-hidden">
                  <p className="text-4xl md:text-5xl font-bold text-center leading-tight break-words w-full max-h-full overflow-y-auto text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {currentItem.message ? (typeof currentItem.message === 'string' ? currentItem.message.replace(/\d+\s*(วินาที|second|seconds)/gi, '').trim() : currentItem.message) : ''}
                  </p>
              </div>

              {/* Venue Logo at Bottom */}
              <div className="h-24 bg-black/30 flex items-center justify-center gap-3 mt-auto border-t border-white/10 z-10">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]">
                       <Image
                          src={providerInfo.logo}
                          alt="Logo"
                          width={40}
                          height={40}
                          unoptimized
                          className="object-cover"
                       />
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37] tracking-wider uppercase">{providerInfo.name}</span>
              </div>

              {/* Animated Background Elements for the Card */}
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 animate-spin-slow pointer-events-none"></div>
          </div>
        )}
        </div>
      )}
    </main>
  );
}
