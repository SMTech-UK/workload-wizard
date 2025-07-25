"use client"

import Footer from "@/components/footer";
import LandingNav from "@/components/landing-nav";
import LandingHero from "@/components/landing-page";
import { useLoadingOverlay } from "./layout";
import { useEffect } from "react";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

export default function Home() {
  const { setLoading } = useLoadingOverlay();
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [setLoading]);
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
