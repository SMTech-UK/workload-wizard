import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Knock } from "@knocklabs/node"
import { redirect } from "next/navigation";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { neobrutalism } from '@clerk/themes'

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

export const metadata: Metadata = {
  title: "WorkloadWizard",
  description: "Workload Wizard is a tool that helps you manage your workload",
};

export default async function RootLayout({
  children,
  ...props
}: any) {
  return (
    <ClerkProvider appearance={{
        baseTheme: neobrutalism,
    }}>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster position="top-right" richColors closeButton />
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
    </ClerkProvider>
  );
}
