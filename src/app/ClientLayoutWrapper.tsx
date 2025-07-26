"use client";

import React from "react";
import { useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { KnockProvider } from "@knocklabs/react";
import { ConvexReactClient } from "convex/react";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

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
  
  // Create Convex client inside the client component
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <KnockProviderWrapper>
        {children}
      </KnockProviderWrapper>
    </ConvexProviderWithClerk>
  );
} 