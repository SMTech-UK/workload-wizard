'use client';

import { useDevMode } from '@/hooks/useDevMode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Settings, Bug, Loader2 } from 'lucide-react';

interface DevRouteGuardProps {
  children: React.ReactNode;
}

export default function DevRouteGuard({ children }: DevRouteGuardProps) {
  const { shouldShowDevTools, isAdmin, devMode } = useDevMode();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to allow dev mode state to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !shouldShowDevTools) {
      // Only redirect after loading is complete and dev tools should not be shown
      router.push('/dashboard');
    }
  }, [shouldShowDevTools, router, isLoading]);

  // Show loading state while determining dev mode
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Checking development mode access...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shouldShowDevTools) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This area is restricted to administrators with development mode enabled.
            </p>
            
            {!isAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Admin Required:</strong> You need administrator privileges to access developer tools.
                </p>
              </div>
            )}
            
            {isAdmin && !devMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Dev Mode Required:</strong> Enable development mode in your settings to access these tools.
                </p>
                <Button 
                  onClick={() => router.push('/dashboard?settings=general')}
                  className="mt-2"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Open Settings
                </Button>
              </div>
            )}
            
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
} 