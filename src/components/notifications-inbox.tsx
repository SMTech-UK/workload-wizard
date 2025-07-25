"use client"

import {
  Bell,
  Check,
  Archive,
  Eye,
  EyeOff,
  Search,
  Clock,
  User,
  BookOpen,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Info,
  MessageSquare,
  Settings,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import {
  useKnockClient,
  useNotifications,
  useNotificationStore,
} from "@knocklabs/react";
import { useEffect } from "react";
import type { FeedItem } from "@knocklabs/client";
import { format, formatDistanceToNow, differenceInHours, parseISO } from 'date-fns';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface RecentChange {
  id: string
  type: "staff_update" | "allocation_change" | "module_assignment" | "system_update"
  title: string
  description: string
  timestamp: string
  user: string
  changes: string[]
}


// Helper to extract a string title from the first block
function getNotificationTitle(notification: FeedItem) {
  const block = notification.blocks[0];
  if (!block) return { value: "Notification", isHtml: false };
  if (typeof block === "object") {
    if ('rendered' in block && typeof block.rendered === 'string') return { value: block.rendered, isHtml: true };
    if ('text' in block && typeof block.text === 'string') return { value: block.text, isHtml: false };
    if ('content' in block && typeof block.content === 'string') return { value: block.content, isHtml: false };
  }
  return { value: "Notification", isHtml: false };
}

function formatNotificationTimestamp(timestamp: string) {
  // timestamp is ISO string
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  const now = new Date();
  const hoursAgo = differenceInHours(now, date);
  if (hoursAgo < 24) {
    // Show relative time with tooltip
    return {
      display: formatDistanceToNow(date, { addSuffix: true }),
      tooltip: format(date, 'PPpp'),
      showTooltip: true,
    };
  } else {
    // Show full date, no tooltip
    return {
      display: format(date, 'PPpp'),
      tooltip: '',
      showTooltip: false,
    };
  }
}

// Add a helper to capitalize the priority string
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function NotificationsInbox() {
  // Knock integration
  const knockClient = useKnockClient();
  const feedClient = useNotifications(
    knockClient,
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!
  );
  const { items, metadata, loading } = useNotificationStore(feedClient);

  const recentChangesFeedClient = useNotifications(
    knockClient,
    process.env.NEXT_PUBLIC_KNOCK_RECENT_CHANGES_CHANNEL_ID!
  );
  const { items: recentChangesItems, loading: loadingRecentChanges } = useNotificationStore(recentChangesFeedClient);
  useEffect(() => { recentChangesFeedClient.fetch(); }, [recentChangesFeedClient]);

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Change filterType to filterPriority
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  // Add state to track the active tab:
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    feedClient.fetch();
  }, [feedClient]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-4 w-4" />
      case "mention":
        return <MessageSquare className="h-4 w-4" />
      case "review":
        return <Eye className="h-4 w-4" />
      case "update":
        return <Info className="h-4 w-4" />
      case "alert":
        return <AlertCircle className="h-4 w-4" />
      case "approval":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "staff_update":
        return <User className="h-4 w-4" />
      case "allocation_change":
        return <BarChart3 className="h-4 w-4" />
      case "module_assignment":
        return <BookOpen className="h-4 w-4" />
      case "system_update":
        return <Settings className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Filtering logic for Knock notifications
  const filteredNotifications = items.filter((notification: FeedItem) => {
    const title = getNotificationTitle(notification).value.toLowerCase();
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      notification.data?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    // In the filtering logic, replace matchesType with matchesPriority:
    const matchesPriority =
      filterPriority === "all" || (notification.data?.priority?.toLowerCase?.() === filterPriority);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notification.read_at) ||
      (filterStatus === "read" && notification.read_at) ||
      (filterStatus === "archived" && notification.archived_at);
    return matchesSearch && matchesPriority && matchesStatus && !notification.archived_at;
  });

  const unreadCount = metadata?.unread_count || 0;

  // Knock actions
  const markAsRead = (item: FeedItem) => {
    feedClient.markAsRead(item);
  };
  const markAsUnread = (item: FeedItem) => {
    feedClient.markAsUnread(item);
  };
  const archiveNotification = (item: FeedItem) => {
    feedClient.markAsArchived(item);
  };
  const markAllAsRead = () => {
    feedClient.markAllAsRead();
  };
  const markAllAsUnread = () => {
    items.forEach((item) => feedClient.markAsUnread(item));
  };
  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]));
  };
  const bulkMarkAsRead = () => {
    selectedNotifications.forEach((id) => {
      const item = items.find((n) => n.id === id);
      if (item) feedClient.markAsRead(item);
    });
    setSelectedNotifications([]);
  };
  const bulkArchive = () => {
    selectedNotifications.forEach((id) => {
      const item = items.find((n) => n.id === id);
      if (item) feedClient.markAsArchived(item);
    });
    setSelectedNotifications([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600">Stay updated with your workload and assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'notifications' ? (
              unreadCount > 0 ? (
                <Button variant="outline" onClick={markAllAsRead} className="hover:bg-gray-50 bg-transparent">
                  <Check className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              ) : (
                <Button variant="outline" onClick={markAllAsUnread} className="hover:bg-gray-50 bg-transparent">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Mark all unread
                </Button>
              )
            ) : (
              recentChangesItems.filter(n => !n.read_at).length > 0 ? (
                <Button variant="outline" onClick={() => recentChangesFeedClient.markAllAsRead()} className="hover:bg-gray-50 bg-transparent">
                  <Check className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              ) : (
                <Button variant="outline" onClick={() => recentChangesItems.forEach(item => recentChangesFeedClient.markAsUnread(item))} className="hover:bg-gray-50 bg-transparent">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Mark all unread
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Notifications
            {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="recent-changes" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Recent Changes
            {recentChangesItems.filter(n => !n.read_at).length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{recentChangesItems.filter(n => !n.read_at).length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters and Search */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40 border-gray-300">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 border-gray-300">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">{selectedNotifications.length} selected</span>
                  <Button variant="outline" size="sm" onClick={bulkMarkAsRead}>
                    <Check className="h-3 w-3 mr-1" />
                    Mark read
                  </Button>
                  <Button variant="outline" size="sm" onClick={bulkArchive}>
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-2">
            {loading ? (
              <Card className="border border-gray-200 shadow-sm bg-white h-28">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading notifications...</h3>
                  <p className="text-gray-600">Please wait while we fetch the latest notifications.</p>
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[7rem] border border-dashed border-gray-200 rounded-lg bg-gray-50 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600 text-xs">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredNotifications.map(notification => {
                const titleObj = getNotificationTitle(notification);
                const priority = notification.data?.priority || 'Low';
                return (
                  <Card
                    key={notification.id}
                    className={`border shadow-sm transition-colors hover:bg-gray-50 ${
                      notification.read_at ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"
                    } h-28`}
                  >
                    <div
                      onClick={() => {
                        notification.data?.action_url ? window.open(notification.data.action_url, '_blank', 'noopener,noreferrer') : undefined;
                      }}
                      className={`p-4 h-full flex items-center relative ${(notification.data?.action_url ?? '') ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => toggleNotificationSelection(notification.id)}
                          onClick={e => e.stopPropagation()}
                          className="mt-1"
                        />

                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notification.read_at ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {getNotificationIcon(notification.data?.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className={`font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap ${notification.read_at ? "text-gray-900" : "text-gray-900 font-semibold"}`}
                                >
                                  {titleObj.isHtml ? (
                                    <span dangerouslySetInnerHTML={{ __html: titleObj.value }} />
                                  ) : (
                                    titleObj.value
                                  )}
                                </h3>
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(priority)}`}>{capitalize(priority)}</Badge>
                                {notification.data?.action_required === true && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs hover:bg-orange-100 focus:bg-orange-100 active:bg-orange-100">Action Required</Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{notification.data?.description}</p>
                              <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatNotificationTimestamp(notification.inserted_at).showTooltip ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>{formatNotificationTimestamp(notification.inserted_at).display}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{formatNotificationTimestamp(notification.inserted_at).tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span>{formatNotificationTimestamp(notification.inserted_at).display}</span>
                                  )}
                                </div>
                                {notification.data?.related_user && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {notification.data.related_user}
                                  </div>
                                )}
                                {notification.data?.related_module && (
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {notification.data.related_module}
                                  </div>
                                )}
                                {notification.data?.vars?.app_url && (
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="ml-2 px-2 py-1 text-xs h-7 mt-1"
                                  >
                                    <a href={notification.data.vars.app_url} target="_blank" rel="noopener noreferrer">Open</a>
                                  </Button>
                                )}
                                {notification.data?.actions?.[0]?.url && (
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="ml-2 px-2 py-1 text-xs h-7 mt-1"
                                  >
                                    <a href={notification.data.actions[0].url} target="_blank" rel="noopener noreferrer">
                                      {notification.data.actions[0].name || 'Open'}
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="absolute top-4 right-4 flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => { e.stopPropagation(); notification.read_at ? markAsUnread(notification) : markAsRead(notification) }}
                                className="hover:bg-gray-100"
                              >
                                {notification.read_at ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => { e.stopPropagation(); archiveNotification(notification) }}
                                className="hover:bg-gray-100"
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent-changes" className="space-y-6">
          {/* New Knock feed for recent changes */}
          <div className="space-y-4 mt-6">
            {loadingRecentChanges ? (
              <Card className="border border-gray-200 shadow-sm bg-white h-28">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading recent changes...</h3>
                </CardContent>
              </Card>
            ) : recentChangesItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[7rem] border border-dashed border-gray-200 rounded-lg bg-gray-50 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No recent changes found</h3>
              </div>
            ) : (
              recentChangesItems.map(notification => {
                const titleObj = getNotificationTitle(notification);
                return (
                  <Card key={notification.id} className={`border shadow-sm ${notification.read_at ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'} h-28`}>
                    <div
                      onClick={() => {
                        if (notification.data && notification.data.entityId) {
                          window.open(`/entities/${notification.data.entityId}`, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={`p-4 h-full flex items-center relative ${(notification.data?.entityId ?? '') ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${notification.data?.type === 'create' ? 'bg-green-100 text-green-700' :
                            notification.data?.type === 'edit' ? 'bg-orange-100 text-orange-700' :
                            notification.data?.type === 'delete' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'}`}
                        >
                          {notification.data?.type === 'create' ? <PlusCircle className="h-4 w-4" /> :
                           notification.data?.type === 'edit' ? <Pencil className="h-4 w-4" /> :
                           notification.data?.type === 'delete' ? <Trash2 className="h-4 w-4" /> :
                           getChangeIcon(notification.data?.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap text-gray-900">
                                  {titleObj.isHtml ? (
                                    <span dangerouslySetInnerHTML={{ __html: titleObj.value }} />
                                  ) : (
                                    titleObj.value
                                  )}
                                </h3>
                              </div>
                              <p className="text-[11px] text-gray-600 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{notification.data?.description}</p>
                              <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatNotificationTimestamp(notification.inserted_at).showTooltip ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>{formatNotificationTimestamp(notification.inserted_at).display}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{formatNotificationTimestamp(notification.inserted_at).tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span>{formatNotificationTimestamp(notification.inserted_at).display}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => { e.stopPropagation(); notification.read_at ? recentChangesFeedClient.markAsUnread(notification) : recentChangesFeedClient.markAsRead(notification) }}
                          className="hover:bg-gray-100"
                        >
                          {notification.read_at ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
