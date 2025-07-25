"use client";

import localFont from "next/font/local";
import "../styles/globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Knock } from "@knocklabs/node"
import { redirect } from "next/navigation";
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { neobrutalism } from '@clerk/themes'
import { ConvexReactClient } from "convex/react";

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
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster position="top-right" richColors closeButton />
        </ClerkProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  );
}
