"use client";

import NotificationsInbox from "@/components/notifications-inbox";
import Navigation from "@/components/navigation";

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white">
        <Navigation activeTab="inbox" setActiveTab={() => {}} />
      </div>
      <div className="max-w-4xl mx-auto py-8">
        <NotificationsInbox />
      </div>
    </div>
  );
} 