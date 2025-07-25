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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { timeAgo } from "@/lib/notify";
import type { Id } from "../../convex/_generated/dataModel";

interface Notification {
  id: string
  type: "assignment" | "mention" | "review" | "update" | "alert" | "approval"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  isArchived: boolean
  priority: "low" | "medium" | "high"
  relatedUser?: string
  relatedModule?: string
  actionRequired?: boolean
}

interface RecentChange {
  id: string
  type: "staff_update" | "allocation_change" | "module_assignment" | "system_update"
  title: string
  description: string
  timestamp: string
  user: string
  changes: string[]
}

interface NotificationsInboxProps {
  initialTab?: 'notifications' | 'recent-changes';
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "assignment",
    title: "New Module Assignment",
    description: "You have been assigned to teach CS301 - Software Engineering for Semester 2",
    timestamp: "2 hours ago",
    isRead: false,
    isArchived: false,
    priority: "high",
    relatedUser: "Dr. Smith",
    relatedModule: "CS301",
    actionRequired: true,
  },
  {
    id: "2",
    type: "review",
    title: "Workload Review Required",
    description: "Your administrative allocations for next semester require approval",
    timestamp: "4 hours ago",
    isRead: false,
    isArchived: false,
    priority: "medium",
    actionRequired: true,
  },
  {
    id: "3",
    type: "mention",
    title: "Mentioned in Discussion",
    description: "Dr. Johnson mentioned you in a discussion about curriculum development",
    timestamp: "1 day ago",
    isRead: true,
    isArchived: false,
    priority: "low",
    relatedUser: "Dr. Johnson",
  },
  {
    id: "4",
    type: "update",
    title: "Profile Updated",
    description: "Your staff profile has been updated with new contact information",
    timestamp: "2 days ago",
    isRead: true,
    isArchived: false,
    priority: "low",
  },
  {
    id: "5",
    type: "alert",
    title: "Capacity Warning",
    description: "Your workload is approaching maximum capacity (95%)",
    timestamp: "3 days ago",
    isRead: false,
    isArchived: false,
    priority: "high",
    actionRequired: true,
  },
  {
    id: "6",
    type: "approval",
    title: "Allocation Approved",
    description: "Your request for additional research hours has been approved",
    timestamp: "1 week ago",
    isRead: true,
    isArchived: false,
    priority: "medium",
  },
]

// Add a helper function to capitalize each word
function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function NotificationsInbox({ initialTab = 'notifications' }: NotificationsInboxProps) {
  // Fetch notifications from Convex
  const dbNotifications = useQuery(api.notifications.getNotifications) ?? [];
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Map DB notifications to UI Notification interface
  const notifications: Notification[] = dbNotifications.map((n: any) => ({
    id: n._id,
    type: n.type,
    title: n.title,
    description: n.description,
    timestamp: n.timestamp,
    isRead: n.isRead,
    isArchived: n.isArchived,
    priority: n.priority,
    relatedUser: n.relatedUser,
    relatedModule: n.relatedModule,
    actionRequired: n.actionRequired,
  }));

  // Fetch recent activities from Convex
  const recentActivities = useQuery(api.recent_activity.getAll) ?? [];
  const isLoadingRecent = recentActivities === undefined;

  // Map Convex recent_activity documents to RecentChange interface
  const mappedRecentChanges: RecentChange[] = (recentActivities || []).map((activity: any) => ({
    id: activity._id,
    type: activity.changeType || "system_update",
    title: activity.action || activity.entity || "Recent Change",
    description: activity.formatted || activity.details?.description || activity.entity || "",
    timestamp: activity.timestamp,
    user: activity.modifiedBy && activity.modifiedBy.length > 0 ? activity.modifiedBy[0].name : "System",
    changes: Array.isArray(activity.details?.changes)
      ? activity.details.changes
      : (activity.details?.change ? [activity.details.change] : []),
  }));

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

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || notification.type === filterType
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notification.isRead) ||
      (filterStatus === "read" && notification.isRead) ||
      (filterStatus === "archived" && notification.isArchived)

    return matchesSearch && matchesType && matchesStatus && !notification.isArchived
  })

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length

  // Backend mutations
  const markNotificationAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markNotificationAsUnread = useMutation(api.notifications.markNotificationAsUnread);
  const archiveNotificationMutation = useMutation(api.notifications.archiveNotification);
  const markAllNotificationsAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  const markAsRead = async (id: string) => {
    await markNotificationAsRead({ id: id as Id<'notifications'> });
  }

  const markAsUnread = async (id: string) => {
    await markNotificationAsUnread({ id: id as Id<'notifications'> });
  }

  const archiveNotification = async (id: string) => {
    await archiveNotificationMutation({ id: id as Id<'notifications'> });
  }

  const markAllAsRead = async () => {
    await markAllNotificationsAsRead({});
  }

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]))
  }

  const bulkMarkAsRead = async () => {
    await Promise.all(selectedNotifications.map(id => markAsRead(id)));
    setSelectedNotifications([])
  }

  const bulkArchive = async () => {
    await Promise.all(selectedNotifications.map(id => archiveNotification(id)));
    setSelectedNotifications([])
  }

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
            <Button variant="outline" onClick={markAllAsRead} className="hover:bg-gray-50 bg-transparent">
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">{unreadCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="recent-changes" className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2">
            Recent Changes
            {/* If you want a badge for recent changes, add logic here */}
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
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40 border-gray-300">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="assignment">Assignments</SelectItem>
                      <SelectItem value="mention">Mentions</SelectItem>
                      <SelectItem value="review">Reviews</SelectItem>
                      <SelectItem value="update">Updates</SelectItem>
                      <SelectItem value="alert">Alerts</SelectItem>
                      <SelectItem value="approval">Approvals</SelectItem>
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
            {filteredNotifications.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border shadow-sm transition-colors hover:bg-gray-50 ${
                    notification.isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1"
                      />

                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notification.isRead ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`font-medium ${notification.isRead ? "text-gray-900" : "text-gray-900 font-semibold"}`}
                              >
                                {notification.title}
                              </h3>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
                              {notification.actionRequired && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">Action Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.timestamp}
                              </div>
                              {notification.relatedUser && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {notification.relatedUser}
                                </div>
                              )}
                              {notification.relatedModule && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {notification.relatedModule}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)
                              }
                              className="hover:bg-gray-100"
                            >
                              {notification.isRead ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => archiveNotification(notification.id)}
                              className="hover:bg-gray-100"
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent-changes" className="space-y-6">
          {/* Recent Changes List */}
          <div className="space-y-4">
            {isLoadingRecent ? (
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading recent changes...</h3>
                </CardContent>
              </Card>
            ) : mappedRecentChanges.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent changes found</h3>
                  <p className="text-gray-600">Recent activity will appear here as changes are made</p>
                </CardContent>
              </Card>
            ) : (
              mappedRecentChanges.map((change: RecentChange) => (
                <Card key={change.id} className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getChangeIcon(change.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{capitalizeWords(change.title)}</h3>
                            <p className="text-sm text-gray-600">{change.description}</p>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span
                              title={new Date(change.timestamp).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            >
                              {(() => {
                                const date = new Date(change.timestamp);
                                const now = new Date();
                                const diffMs = now.getTime() - date.getTime();
                                const diffHours = diffMs / (1000 * 60 * 60);
                                if (diffHours < 24) {
                                  return timeAgo(date.getTime());
                                } else {
                                  return date.toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });
                                }
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {change.user}
                          </div>
                        </div>

                        <div className="space-y-1">
                          {change.changes.map((changeItem: string, index: number) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {changeItem}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
