"use client";

import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  // When this state is set we know the server
  // has stored the user.
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.users.store);
  const prevAuth = useRef(isAuthenticated);

  // Fetch systemRole from Convex for the current user
  const systemRoleResult = useQuery(api.users.getUserBySubject, user?.id ? { subject: user.id } : "skip");

  // Move createUser outside useEffect
  const createUser = async (user: any) => {
    if (!user) return;
    const id = await storeUser({});
    setUserId(id);
    try {
      await fetch('/api/knock-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          name: user.fullName,
          avatar: user.imageUrl,
          locale: 'en-GB',
          timezone: 'Europe/London',
          systemRole: systemRoleResult?.systemRole ?? undefined,
        }),
      });
    } catch (err) {
      // Ignore errors for now
    }
  };

  useEffect(() => {
    // Only run on transition from not authenticated to authenticated
    if (!prevAuth.current && isAuthenticated && user) {
      createUser(user);
    }
    prevAuth.current = isAuthenticated;
    return () => setUserId(null);
  }, [isAuthenticated, storeUser, user]);
  // Combine the local state with the state from context
  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}