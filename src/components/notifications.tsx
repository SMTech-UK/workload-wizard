'use client';

import { useState } from 'react';
import { Bell, CheckIcon, Mail, Eye, Inbox } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { timeAgo } from '@/lib/notify';
import { toast } from 'sonner';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useKnockClient,
  useNotifications,
  useNotificationStore,
} from '@knocklabs/react';
import { useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

// Add a helper to extract the notification title
function getNotificationTitle(notification: any) {
  const block = notification.blocks[0];
  if (!block) return { value: 'Notification', isHtml: false };
  if (typeof block === 'object') {
    if ('rendered' in block && typeof block.rendered === 'string') return { value: block.rendered, isHtml: true };
    if ('text' in block && typeof block.text === 'string') return { value: block.text, isHtml: false };
    if ('content' in block && typeof block.content === 'string') return { value: block.content, isHtml: false };
  }
  return { value: 'Notification', isHtml: false };
}

export function Notifications() {
  const knockClient = useKnockClient();
  const feedClient = useNotifications(
    knockClient,
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!
  );
  const { items, metadata, loading } = useNotificationStore(feedClient);
  const router = useRouter();

  useEffect(() => {
    feedClient.fetch();
  }, [feedClient]);

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
                    <p className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={titleObj.isHtml ? undefined : titleObj.value}>
                      {titleObj.isHtml ? <span dangerouslySetInnerHTML={{ __html: titleObj.value }} /> : titleObj.value}
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
        {unreadCount > 0 && (
          <>
            <Separator />
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full text-xs h-7"
                onClick={() => feedClient.markAllAsRead()}
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}