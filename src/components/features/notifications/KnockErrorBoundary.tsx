"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class KnockErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.warn('Knock client error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-4 text-center text-gray-500">
          <p>Notifications temporarily unavailable</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to check if we're in a browser environment
export function useIsClient() {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

// Wrapper component for Knock-dependent components
export function KnockSafeWrapper({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return fallback || <div className="p-4 text-center text-gray-500">Loading...</div>;
  }
  
  return (
    <KnockErrorBoundary fallback={fallback}>
      {children}
    </KnockErrorBoundary>
  );
} 