'use client';

import { useState } from 'react';
import { Bell, CheckIcon, Mail } from 'lucide-react';
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

export function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead
  );

  const hasNewNotifications = !!notifications?.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="p-2 relative">
          <Bell width={16} />
          {hasNewNotifications && (
            <div className="absolute -top-0 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notifications.length}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/inbox" passHref legacyBehavior>
                <Button asChild variant="ghost" size="icon" aria-label="Go to inbox">
                  <a>
                    <Mail className="w-5 h-5" />
                  </a>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              Go to inbox
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator />
        <ScrollArea className="max-h-[300px] overflow-y-auto">
          <div className="space-y-4 p-4">
            {!hasNewNotifications && <p>You have no unread notifications.</p>}
            {hasNewNotifications &&
              notifications?.map(({ _id, text, _creationTime }) => (
                <div
                  key={_id}
                  className="grid grid-cols-[1fr_auto] items-start gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{text}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(_creationTime)}
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      await markAsRead({ id: _id });
                      toast.success('Notification marked as read');
                    }}
                    variant="ghost"
                    size="icon"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </Button>
                </div>
              ))}
          </div>
        </ScrollArea>
        {hasNewNotifications && (
          <>
            <Separator />
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  await markAllAsRead();
                  toast.success('All notifications marked as read');
                }}
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