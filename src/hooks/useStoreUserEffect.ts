"use client";

import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Type for the getUserBySubject query result
type UserBySubjectResult = {
  systemRole: string | null;
  settings: {
    language: string;
    timezone: string;
    theme: string;
    notifyEmail: boolean;
    notifyPush: boolean;
    profilePublic: boolean;
  } | null;
  specialism: string | null;
  jobTitle: string | null;
  team: string | null;
} | null;

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  // When this state is set we know the server
  // has stored the user.
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.users.store);
  const prevAuth = useRef(isAuthenticated);
  
  // Track if Knock sync has already been performed for current user state
  const knockSyncRef = useRef<string | null>(null);

  // Fetch systemRole from Convex for the current user
  const systemRoleResult = useQuery(api.users.getUserBySubject, user?.id ? { subject: user.id } : "skip") as UserBySubjectResult;

  // Helper function to get dynamic locale and timezone
  const getLocaleAndTimezone = () => {
    // Try to get from user settings first
    if (systemRoleResult?.settings?.language && systemRoleResult?.settings?.timezone) {
      return {
        locale: systemRoleResult.settings.language === 'en' ? 'en-GB' : systemRoleResult.settings.language,
        timezone: systemRoleResult.settings.timezone
      };
    }
    
    // Fallback to browser environment
    try {
      const browserLocale = navigator.language || 'en-GB';
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London';
      
      return {
        locale: browserLocale,
        timezone: browserTimezone
      };
    } catch (error) {
      console.warn('Failed to detect browser locale/timezone, using defaults:', error);
      return {
        locale: 'en-GB',
        timezone: 'Europe/London'
      };
    }
  };

  // Move createUser outside useEffect
  const createUser = async (clerkUser: NonNullable<ReturnType<typeof useUser>['user']>) => {
    if (!clerkUser) return;
    
    try {
      // Extract user data and pass it to storeUser
      const userData = {
        jobTitle: clerkUser.publicMetadata?.jobTitle as string | undefined,
        team: clerkUser.publicMetadata?.team as string | undefined,
        specialism: clerkUser.publicMetadata?.specialism as string | undefined,
        theme: clerkUser.publicMetadata?.theme as string | undefined,
      };
      
      const id = await storeUser(userData);
      setUserId(id);
    } catch (error) {
      console.error("Failed to store user:", error);
      // Optionally handle the error more gracefully
      // For now, we'll just log it and let the component handle the failed state
    }
  };

  // Effect 1: Store user in Convex when authenticated
  useEffect(() => {
    // Only run on transition from not authenticated to authenticated
    if (!prevAuth.current && isAuthenticated && user) {
      createUser(user);
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, user]);

  // Cleanup effect: Reset userId on unmount
  useEffect(() => {
    return () => setUserId(null);
  }, []);

  // Effect 2: Sync with Knock after systemRoleResult is loaded and userId is set
  useEffect(() => {
    if (
      user &&
      userId &&
      systemRoleResult !== undefined && // Proper type check instead of unsafe cast
      systemRoleResult !== null // Ensure we have actual data, not loading state
    ) {
      // Create a unique key for this sync operation to prevent duplicates
      const syncKey = `${user.id}-${userId}-${systemRoleResult?.systemRole ?? 'null'}`;
      
      // Check if we've already synced with this exact state
      if (knockSyncRef.current === syncKey) {
        return;
      }

      const syncKnock = async () => {
        try {
          const { locale, timezone } = getLocaleAndTimezone();
          
          const response = await fetch('/api/knock-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress,
              name: user.fullName,
              avatar: user.imageUrl,
              locale,
              timezone,
              systemRole: systemRoleResult?.systemRole ?? undefined,
            }),
          });

          if (!response.ok) {
            throw new Error(`Knock sync failed with status: ${response.status}`);
          }

          // Mark this sync as completed
          knockSyncRef.current = syncKey;
          console.log('Knock sync completed successfully');
        } catch (error) {
          console.error('Failed to sync with Knock:', error);
          // Don't mark as completed on error, so it can retry on next render
        }
      };
      
      syncKnock();
    }
  }, [user, userId, systemRoleResult]);
  
  // Combine the local state with the state from context
  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}