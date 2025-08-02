'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

export function useDevMode() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [devMode, setDevMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Always call useQuery, but handle authentication errors gracefully
  const profileFields = useQuery('users:getProfileFields' as any);
  
  // Check if user is admin - only if we have valid data and user is authenticated
  // Handle the case where profileFields might be null due to auth errors
  const isAdmin = isLoaded && isSignedIn && user && profileFields && 
    (profileFields.systemRole === 'admin' || profileFields.systemRole === 'administrator');
  
  // Load dev mode from localStorage (only for admins)
  useEffect(() => {
    if (isLoaded && isAdmin && isClient) {
      try {
        const savedDevMode = localStorage.getItem('devMode') === 'true';
        setDevMode(savedDevMode);
      } catch (error) {
        console.warn('Failed to load dev mode from localStorage:', error);
      }
    }
  }, [isLoaded, isAdmin, isClient]);
  
  // Toggle dev mode with immediate state update
  const toggleDevMode = useCallback((enabled: boolean) => {
    if (isAdmin && isClient) {
      try {
        setDevMode(enabled);
        localStorage.setItem('devMode', enabled.toString());
        // Force a re-render by triggering a state update
        setTimeout(() => {
          setDevMode(enabled);
        }, 0);
      } catch (error) {
        console.warn('Failed to save dev mode to localStorage:', error);
      }
    }
  }, [isAdmin, isClient]);
  
  // Check if dev tools should be shown
  const shouldShowDevTools = isAdmin && devMode && isClient;
  
  return {
    devMode,
    isAdmin,
    shouldShowDevTools,
    toggleDevMode,
  };
} 