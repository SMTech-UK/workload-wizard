"use client";

import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";
import { KnockSafeWrapper } from "@/components/KnockErrorBoundary";

// Dynamically import NotificationsInbox to avoid SSR issues
const NotificationsInbox = dynamic(
  () => import("@/components/notifications-inbox"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    ),
  }
);

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white">
        <Navigation activeTab="inbox" setActiveTab={() => {}} />
      </div>
      <div className="max-w-4xl mx-auto py-8">
        <KnockSafeWrapper fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Notifications not available</p>
              <p className="text-sm text-gray-400">Please check your connection and try again</p>
            </div>
          </div>
        }>
          <NotificationsInbox />
        </KnockSafeWrapper>
      </div>
    </div>
  );
} 