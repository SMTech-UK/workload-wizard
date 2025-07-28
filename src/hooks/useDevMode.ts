'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useDevMode() {
  const { user, isLoaded } = useUser();
  const [devMode, setDevMode] = useState(false);
  
  // Get user profile to check system role
  const profileFields = useQuery(api.users.getProfileFields);
  
  // Check if user is admin
  const isAdmin = profileFields?.systemRole === 'admin' || profileFields?.systemRole === 'administrator';
  
  // Load dev mode from localStorage (only for admins)
  useEffect(() => {
    if (isLoaded && isAdmin) {
      const savedDevMode = localStorage.getItem('devMode') === 'true';
      setDevMode(savedDevMode);
    }
  }, [isLoaded, isAdmin]);
  
  // Toggle dev mode with immediate state update
  const toggleDevMode = useCallback((enabled: boolean) => {
    if (isAdmin) {
      setDevMode(enabled);
      localStorage.setItem('devMode', enabled.toString());
      // Force a re-render by triggering a state update
      setTimeout(() => {
        setDevMode(enabled);
      }, 0);
    }
  }, [isAdmin]);
  
  // Check if dev tools should be shown
  const shouldShowDevTools = isAdmin && devMode;
  
  return {
    devMode,
    isAdmin,
    shouldShowDevTools,
    toggleDevMode,
  };
} 