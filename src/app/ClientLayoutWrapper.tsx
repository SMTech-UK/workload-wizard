"use client";

import React from "react";
import { useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { KnockProvider } from "@knocklabs/react";
import { ConvexReactClient } from "convex/react";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

// Validate environment variable and create Convex client outside component
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not defined");
}

// Create Convex client once outside the component to avoid recreation on every render
const convex = new ConvexReactClient(CONVEX_URL);

function KnockProviderWrapper({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  if (!userId || !process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY) return <>{children}</>;
  return (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY}
      user={{ id: userId }}
    >
      {children}
    </KnockProvider>
  );
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const { userId, isLoaded } = useAuth();
  
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <KnockProviderWrapper>
        {children}
      </KnockProviderWrapper>
    </ConvexProviderWithClerk>
  );
} 