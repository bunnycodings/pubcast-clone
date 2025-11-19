"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Instagram, Music, MessageSquare } from "lucide-react"; 
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
  const [currentItem, setCurrentItem] = useState<any>(DEFAULT_QUEUE[0]);
  const [show, setShow] = useState(true);
  
  // Use a ref to track the queue and processing state to avoid stale closures
  const queueRef = useRef<any[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

        // Wait for duration (use item.duration or default to 10s)
        const duration = next.duration || 10000;
        displayTimeoutRef.current = setTimeout(() => {
            isProcessingRef.current = false;
            processNextItem(); // Process next item immediately
        }, duration);
    } else {
        isProcessingRef.current = false;
    }
  }, []);
  
  // Listen for Broadcast Channel messages
  useEffect(() => {
    const channel = new BroadcastChannel('pubcast_channel');
    
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

    return () => {
        channel.close();
        if (displayTimeoutRef.current) {
            clearTimeout(displayTimeoutRef.current);
        }
    };
  }, [processNextItem]);

  // Determine Icon based on platform
  const getIcon = (platform: string) => {
      switch(platform) {
          case 'instagram': return <Instagram className="w-12 h-12 text-white" />;
          case 'guest': return <MessageSquare className="w-12 h-12 text-white" />;
          default: return <Music className="w-12 h-12 text-white" />;
      }
  };

  // Determine if we should show text overlay on image
  const showTextOverlay = currentItem.mediaUrl && currentItem.message && currentItem.showText !== false;
  const isImageOnly = currentItem.mediaUrl && (!currentItem.message || currentItem.showText === false);
  const isTextOnly = !currentItem.mediaUrl && currentItem.message;

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans">
      {/* Background Context */}
      <div className="absolute inset-0 overflow-hidden">
         <Image
            src={providerInfo.logo}
            alt="Background"
            fill
            className="object-cover opacity-10 blur-xl"
            unoptimized
         />
      </div>
      
      {/* Main Content Container */}
      <div className={`relative z-10 w-full h-full transition-all duration-500 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Image Only Display */}
        {isImageOnly && (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src={currentItem.mediaUrl} 
              alt="User Content" 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        {/* Text Only Display */}
        {isTextOnly && (
          <div className="w-full h-full flex flex-col items-center justify-center px-8">
            <p className={`text-6xl md:text-7xl font-bold text-center leading-tight break-words ${
              currentItem.platform === "system" 
                ? "text-black" 
                : "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            }`}>
              {currentItem.message}
            </p>
          </div>
        )}

        {/* Image with Text Overlay */}
        {showTextOverlay && (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src={currentItem.mediaUrl} 
              alt="User Content" 
              fill
              className="object-contain"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-5xl md:text-6xl font-bold text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] break-words px-8">
                {currentItem.message}
              </p>
            </div>
          </div>
        )}

        {/* Default/System Message */}
        {currentItem.platform === "system" && !currentItem.mediaUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-6xl md:text-7xl font-bold text-center text-black">
              {currentItem.message}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
