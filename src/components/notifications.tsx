'use client';

import React from "react"
import { Bell, Inbox, Mail, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useKnockClient, useNotifications, useNotificationStore } from "@knocklabs/react"
import { formatDistanceToNow, parseISO } from "date-fns"
// Removed DOMPurify import - using simple text sanitization instead
import { KnockErrorBoundary } from "./KnockErrorBoundary"

// Helper function to get notification title
function getNotificationTitle(notification: any) {
  if (notification.blocks && notification.blocks.length > 0) {
    const titleBlock = notification.blocks.find((block: any) => block.type === "text" && block.name === "title")
    if (titleBlock) {
      return titleBlock.content || notification.title || "Notification"
    }
  }
  return notification.title || "Notification"
}

// Main notifications component wrapped in error boundary
function NotificationsInner() {
  // Always call hooks at the top level, before any early returns
  const knockClient = useKnockClient();
  const feedChannelId = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Always call these hooks, but handle the case where they might not work
  const feedClient = useNotifications(
    knockClient,
    feedChannelId || ""
  );
  const { items, metadata, loading } = useNotificationStore(feedClient);

  React.useEffect(() => {
    if (feedClient) {
      try {
        feedClient.fetch();
      } catch (error) {
        console.warn('Failed to fetch notifications:', error);
      }
    }
  }, [feedClient]);

  // Early return after all hooks are called
  if (!knockClient || !feedChannelId || !isSignedIn) {
    return (
      <Button variant="ghost" size="icon" className="p-2 relative">
        <Bell width={16} />
      </Button>
    );
  }

  const unreadCount = metadata?.unread_count || 0;
  // Before slicing for compactNotifications, filter items to only those where !notification.read_at
  const unreadNotifications = items.filter(notification => !notification.read_at);
  const compactNotifications = unreadNotifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="p-2 relative">
          <Bell width={16} />
          {unreadCount > 0 && (
            <div className="absolute -top-0 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-base font-medium">Notifications</h3>
          <div className="flex flex-row items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Go to inbox"
                  onClick={() => router.push('/inbox')}
                >
                  <Inbox className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                Go to inbox
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mark all as read"
                  onClick={() => feedClient.markAllAsRead()}
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                Mark all as read
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-[220px] overflow-y-auto">
          <div className="space-y-2 p-1">
            {loading && <p className="text-xs text-center py-4">Loading...</p>}
            {!loading && compactNotifications.length === 0 && <p className="text-xs text-center py-4">You have no unread notifications.</p>}
            {compactNotifications.map((notification) => {
              const titleObj = getNotificationTitle(notification);
              return (
                <div
                  key={notification.id}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-gray-50 flex-nowrap"
                >
                  <div className="min-w-0 max-w-[250px]">
                    <p className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={titleObj}>
                      {titleObj}
                    </p>
                    <p className="text-[10px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatDistanceToNow(parseISO(notification.inserted_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    onClick={e => { e.stopPropagation(); feedClient.markAsRead(notification); }}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Export the component wrapped in error boundary
export function Notifications() {
  return (
    <KnockErrorBoundary fallback={
      <Button variant="ghost" size="icon" className="p-2 relative">
        <Bell width={16} />
      </Button>
    }>
      <NotificationsInner />
    </KnockErrorBoundary>
  );
}