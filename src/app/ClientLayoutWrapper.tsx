"use client";

import React from "react";
import { useAuth } from '@clerk/nextjs';
import { KnockProvider } from "@knocklabs/react";

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
  return (
    <KnockProviderWrapper>
      {children}
    </KnockProviderWrapper>
  );
} 