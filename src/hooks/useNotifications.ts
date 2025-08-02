import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function useNotifications() {
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  
  // Get all notifications
  const notifications = useQuery('notifications:getAll' as any, {});
  
  // Get a specific notification by ID
  const selectedNotification = useQuery(
    'notifications:getById' as any, 
    selectedNotificationId ? { id: selectedNotificationId } : "skip"
  );
  
  // Get notification settings
  const notificationSettings = useQuery('notification_settings:getAll' as any, {});
  
  // Mutations
  const createNotification = useMutation('notifications:create' as any);
  const updateNotification = useMutation('notifications:update' as any);
  const deleteNotification = useMutation('notifications:remove' as any);
  const markAsRead = useMutation('notifications:markAsRead' as any);
  const markAllAsRead = useMutation('notifications:markAllAsRead' as any);
  
  // Get notifications by user
  const getNotificationsByUser = (userId: Id<'users'>) => {
    return notifications?.filter((notification: any) => notification.userId === userId) || [];
  };
  
  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications?.filter((notification: any) => !notification.isRead) || [];
  };
  
  // Get read notifications
  const getReadNotifications = () => {
    return notifications?.filter((notification: any) => notification.isRead) || [];
  };
  
  // Get notifications by type
  const getNotificationsByType = (type: string) => {
    return notifications?.filter((notification: any) => notification.type === type) || [];
  };
  
  // Get notifications by priority
  const getNotificationsByPriority = (priority: string) => {
    return notifications?.filter((notification: any) => notification.priority === priority) || [];
  };
  
  // Get recent notifications
  const getRecentNotifications = (limit: number = 10) => {
    return notifications?.slice(0, limit) || [];
  };
  
  // Search notifications
  const searchNotifications = (searchTerm: string) => {
    if (!searchTerm.trim()) return notifications || [];
    
    const term = searchTerm.toLowerCase();
    return notifications?.filter((notification: any) => 
      notification.title.toLowerCase().includes(term) ||
      notification.message.toLowerCase().includes(term) ||
      notification.type.toLowerCase().includes(term)
    ) || [];
  };
  
  // Get notification count
  const getUnreadCount = () => {
    return getUnreadNotifications().length;
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ id: notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead({});
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  // Create a new notification
  const createNewNotification = async (data: {
    userId: Id<'users'>;
    title: string;
    message: string;
    type: string;
    priority?: string;
    metadata?: any;
  }) => {
    try {
      await createNotification(data);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };
  
  return {
    // Data
    notifications,
    selectedNotification,
    selectedNotificationId,
    notificationSettings,
    
    // Mutations
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    
    // Actions
    setSelectedNotificationId,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createNewNotification,
    
    // Filtered data
    getNotificationsByUser,
    getUnreadNotifications,
    getReadNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getRecentNotifications,
    searchNotifications,
    
    // Utilities
    getUnreadCount,
    
    // Loading states
    isLoading: notifications === undefined,
  };
} 