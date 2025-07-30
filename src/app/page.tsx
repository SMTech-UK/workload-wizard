"use client"

import Footer from "@/components/layout/footer";
import LandingNav from "@/components/layout/landing-nav";
import LandingHero from "@/components/features/landing-page";
import { useLoadingOverlay } from "@/hooks/useLoadingOverlay";
import { useEffect, useState } from "react";

export default function Home() {
  const { setLoading } = useLoadingOverlay();
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we're on the client side before running effects
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [setLoading, isClient]);
  
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-tr from-pink-500 via-blue-500 to-green-400 opacity-60 dark:opacity-40 blur-2xl" style={{backgroundSize: '200% 200%'}} />
      <LandingNav />
      <LandingHero />
      <Footer />
    </div>
  )
}