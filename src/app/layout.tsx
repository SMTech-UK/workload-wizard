"use client";

import localFont from "next/font/local";
import "../styles/globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Knock } from "@knocklabs/node"
import { redirect } from "next/navigation";
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { neobrutalism } from '@clerk/themes'
import { ConvexReactClient } from "convex/react";
import LoadingOverlay from "@/components/loading-overlay";
import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

// Loading overlay context
const LoadingOverlayContext = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({ loading: false, setLoading: () => {} });

export function useLoadingOverlay() {
  return useContext(LoadingOverlayContext);
}

function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
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

export default function RootLayout({
  children,
  ...props
}: any) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ClerkProvider appearance={{baseTheme: neobrutalism }}>
        <ThemeProvider attribute="class">
          <LoadingOverlayProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
            <Toaster position="top-right" richColors closeButton />
          </LoadingOverlayProvider>
        </ThemeProvider>
      </ClerkProvider>
      <SpeedInsights/>
      <Analytics/>
      </body>
    </html>
  );
}
