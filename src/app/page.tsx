"use client"

import Footer from "@/components/footer";
import LandingNav from "@/components/landing-nav";
import LandingHero from "@/components/landing-page";
import { useLoadingOverlay } from "./layout";
import { useEffect } from "react";

export default function Home() {
  const { setLoading } = useLoadingOverlay();
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [setLoading]);
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">      
      <LandingNav />
      <LandingHero />
      <Footer />
    </div>
  )
}
