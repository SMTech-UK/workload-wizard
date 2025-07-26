import localFont from "next/font/local";
import "../styles/globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from '@clerk/nextjs'
import { neobrutalism } from '@clerk/themes'
import React from "react";
import { ThemeProvider } from "next-themes";
import { KnockProvider } from "@knocklabs/react";
import { LoadingOverlayProvider } from "@/hooks/useLoadingOverlay";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

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

// SEO metadata for the root layout
export const metadata = {
  title: {
    default: "Workload Wizard – Academic Workload Management",
    template: "%s – Workload Wizard"
  },
  description: "Streamline academic workload planning and management. Efficiently allocate teaching hours, track lecturer capacity, and optimize resource utilization for educational institutions.",
  keywords: ["academic workload", "teaching management", "lecturer allocation", "university planning", "educational resources", "workload optimization"],
  authors: [{ name: "Workload Wizard Team" }],
  creator: "Workload Wizard",
  publisher: "Workload Wizard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://workload-wizard.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://workload-wizard.com",
    siteName: "Workload Wizard",
    title: "Workload Wizard – Academic Workload Management",
    description: "Streamline academic workload planning and management for educational institutions.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Workload Wizard Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workload Wizard – Academic Workload Management",
    description: "Streamline academic workload planning and management for educational institutions.",
    images: ["/images/logo.png"],
    creator: "@workloadwizard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider appearance={{baseTheme: neobrutalism }}>
          <ThemeProvider attribute="class">
            <LoadingOverlayProvider>
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
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
