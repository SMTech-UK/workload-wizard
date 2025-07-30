"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from '@clerk/nextjs';
import { KnockProvider } from "@knocklabs/react";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

function KnockProviderWrapper({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check for required environment variables
  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  
  if (!isClient) {
    return <>{children}</>;
  }
  
  if (!knockApiKey) {
    console.warn('⚠️  NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY not found');
    console.warn('   Knock notifications will not work on the client side');
    console.warn('   Add it to your .env.local file as: NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY=pk_test_...');
    return <>{children}</>;
  }
  
  if (!userId) {
    // User not authenticated, don't initialize Knock
    return <>{children}</>;
  }
  
  return (
    <KnockProvider
      apiKey={knockApiKey}
      user={{ id: userId }}
      logLevel="error"
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