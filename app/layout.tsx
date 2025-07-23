import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WorkloadWizard",
  description: "Workload Wizard is a tool that helps you manage your workload",
};

export default function RootLayout({
  children,
  ...props
}: any) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Auth0Provider>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster position="top-right" richColors closeButton />
        </Auth0Provider>
      </body>
    </html>
  );
}
