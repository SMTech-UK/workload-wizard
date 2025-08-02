"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import LoadingOverlay from "@/components/layout/loading-overlay";

// Loading overlay context
const LoadingOverlayContext = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({ loading: false, setLoading: () => {} });

export function useLoadingOverlay() {
  return useContext(LoadingOverlayContext);
}

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false); // Don't show overlay by default

  // Memoize setLoading to prevent unnecessary re-renders
  const setLoadingSafe = useCallback((newLoading: boolean) => {
    setLoading(newLoading);
  }, []);

  // Hide overlay shortly after hydration, with a buffer and fallback
  useEffect(() => {
    let shortTimeout: NodeJS.Timeout | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    try {
      // Buffer: keep overlay for 300ms after hydration
      const buffer = 300;
      shortTimeout = setTimeout(() => setLoadingSafe(false), 300 + buffer); // 300ms + buffer = 600ms total
      fallbackTimeout = setTimeout(() => setLoadingSafe(false), 2000); // Fallback in case of issues
    } catch (error) {
      console.warn('Failed to set up loading overlay timeouts:', error);
    }

    return () => {
      try {
        if (shortTimeout) {
          clearTimeout(shortTimeout);
        }
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout);
        }
      } catch (error) {
        console.warn('Failed to clear loading overlay timeouts:', error);
      }
    };
  }, [setLoadingSafe]);

  return (
    <LoadingOverlayContext.Provider value={{ loading, setLoading: setLoadingSafe }}>
      <LoadingOverlay loading={loading} />
      {children}
    </LoadingOverlayContext.Provider>
  );
} 