"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import LoadingOverlay from "@/components/loading-overlay";

// Loading overlay context
const LoadingOverlayContext = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({ loading: false, setLoading: () => {} });

export function useLoadingOverlay() {
  return useContext(LoadingOverlayContext);
}

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true); // Show overlay immediately

  // Hide overlay shortly after hydration, with a buffer and fallback
  useEffect(() => {
    // Buffer: keep overlay for 300ms after hydration
    const buffer = 300;
    const shortTimeout = setTimeout(() => setLoading(false), 300 + buffer); // 200ms + buffer
    const fallbackTimeout = setTimeout(() => setLoading(false), 2000); // Fallback in case of issues
    return () => {
      clearTimeout(shortTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return (
    <LoadingOverlayContext.Provider value={{ loading, setLoading }}>
      <LoadingOverlay loading={loading} />
      {children}
    </LoadingOverlayContext.Provider>
  );
} 