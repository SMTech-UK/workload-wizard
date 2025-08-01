/**
 * Notification utility functions
 * 
 * Provides functions for notification management, formatting, and delivery
 * based on the new profile-based database schema.
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Notification {
  _id: Id<"notifications">;
  type: 'workload_alert' | 'allocation_change' | 'system_alert' | 'reminder' | 'report_ready' | 'user_activity';
  title: string;
  message: string;
  userId: string;
  organisationId: string;
  entityId?: string;
  entityType?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationTemplate {
  _id: Id<"notification_templates">;
  name: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationSettings {
  _id: Id<"notification_settings">;
  userId: string;
  organisationId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  workloadAlerts: boolean;
  allocationChanges: boolean;
  systemAlerts: boolean;
  reminders: boolean;
  reports: boolean;
  userActivity: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationFilter {
  type?: string;
  priority?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recent: Notification[];
}

export interface NotificationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate notification data
 * @param notification - Notification data to validate
 * @returns Validation result
 */
export function validateNotification(notification: Partial<Notification>): NotificationValidationResult {
  const result: NotificationValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!notification.type) {
    result.errors.push("Notification type is required");
    result.isValid = false;
  }

  if (!notification.title || notification.title.trim().length === 0) {
    result.errors.push("Notification title is required");
    result.isValid = false;
  }

  if (!notification.message || notification.message.trim().length === 0) {
    result.errors.push("Notification message is required");
    result.isValid = false;
  }

  if (!notification.userId) {
    result.errors.push("User ID is required");
    result.isValid = false;
  }

  if (!notification.organisationId) {
    result.errors.push("Organisation ID is required");
    result.isValid = false;
  }

  // Validate notification type
  const validTypes = [
    'workload_alert', 'allocation_change', 'system_alert', 
    'reminder', 'report_ready', 'user_activity'
  ];
  if (notification.type && !validTypes.includes(notification.type)) {
    result.errors.push(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
    result.isValid = false;
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (notification.priority && !validPriorities.includes(notification.priority)) {
    result.errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    result.isValid = false;
  }

  // Validate title length
  if (notification.title && notification.title.length > 100) {
    result.warnings.push("Notification title is quite long - consider a shorter title");
  }

  // Validate message length
  if (notification.message && notification.message.length > 500) {
    result.warnings.push("Notification message is quite long - consider a shorter message");
  }

  return result;
}

/**
 * Validate notification settings
 * @param settings - Notification settings to validate
 * @returns Validation result
 */
export function validateNotificationSettings(settings: Partial<NotificationSettings>): NotificationValidationResult {
  const result: NotificationValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!settings.userId) {
    result.errors.push("User ID is required");
    result.isValid = false;
  }

  if (!settings.organisationId) {
    result.errors.push("Organisation ID is required");
    result.isValid = false;
  }

  // Validate quiet hours
  if (settings.quietHours?.enabled) {
    const startTime = settings.quietHours.startTime;
    const endTime = settings.quietHours.endTime;

    if (!startTime || !endTime) {
      result.errors.push("Start time and end time are required when quiet hours are enabled");
      result.isValid = false;
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      result.errors.push("Start time must be in HH:mm format");
      result.isValid = false;
    }
    if (endTime && !timeRegex.test(endTime)) {
      result.errors.push("End time must be in HH:mm format");
      result.isValid = false;
    }
  }

  return result;
}

// ============================================================================
// NOTIFICATION CREATION FUNCTIONS
// ============================================================================

/**
 * Create notification from template
 * @param template - Notification template
 * @param params - Template parameters
 * @returns Notification object
 */
export function createNotificationFromTemplate(
  template: NotificationTemplate,
  params: {
    userId: string;
    organisationId: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, any>;
  }
): Omit<Notification, '_id'> {
  // Replace placeholders in title and message
  const title = replaceTemplatePlaceholders(template.title, params);
  const message = replaceTemplatePlaceholders(template.message, params);

  return {
    type: template.type as Notification['type'],
    title,
    message,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    entityType: params.entityType,
    priority: template.priority,
    isRead: false,
    isActive: true,
    metadata: params.metadata || {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create workload alert notification
 * @param params - Workload alert parameters
 * @returns Notification object
 */
export function createWorkloadAlertNotification(params: {
  userId: string;
  organisationId: string;
  lecturerName: string;
  utilization: number;
  threshold: number;
  entityId?: string;
}): Omit<Notification, '_id'> {
  const priority = params.utilization > 120 ? 'critical' : 
                   params.utilization > 100 ? 'high' : 'medium';

  return {
    type: 'workload_alert',
    title: 'Workload Alert',
    message: `${params.lecturerName} has ${params.utilization.toFixed(1)}% utilization, exceeding the ${params.threshold}% threshold.`,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    entityType: 'lecturer',
    priority,
    isRead: false,
    isActive: true,
    metadata: {
      lecturerName: params.lecturerName,
      utilization: params.utilization,
      threshold: params.threshold,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create allocation change notification
 * @param params - Allocation change parameters
 * @returns Notification object
 */
export function createAllocationChangeNotification(params: {
  userId: string;
  organisationId: string;
  lecturerName: string;
  moduleCode: string;
  action: 'assigned' | 'removed' | 'updated';
  entityId?: string;
}): Omit<Notification, '_id'> {
  const actionText = {
    assigned: 'assigned to',
    removed: 'removed from',
    updated: 'allocation updated for',
  }[params.action];

  return {
    type: 'allocation_change',
    title: 'Allocation Change',
    message: `${params.lecturerName} has been ${actionText} ${params.moduleCode}.`,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    entityType: 'allocation',
    priority: 'medium',
    isRead: false,
    isActive: true,
    metadata: {
      lecturerName: params.lecturerName,
      moduleCode: params.moduleCode,
      action: params.action,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create system alert notification
 * @param params - System alert parameters
 * @returns Notification object
 */
export function createSystemAlertNotification(params: {
  userId: string;
  organisationId: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  entityId?: string;
}): Omit<Notification, '_id'> {
  return {
    type: 'system_alert',
    title: params.title,
    message: params.message,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    entityType: 'system',
    priority: params.priority,
    isRead: false,
    isActive: true,
    metadata: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create reminder notification
 * @param params - Reminder parameters
 * @returns Notification object
 */
export function createReminderNotification(params: {
  userId: string;
  organisationId: string;
  title: string;
  message: string;
  dueDate?: string;
  entityId?: string;
}): Omit<Notification, '_id'> {
  return {
    type: 'reminder',
    title: params.title,
    message: params.message,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    entityType: 'reminder',
    priority: 'medium',
    isRead: false,
    isActive: true,
    metadata: {
      dueDate: params.dueDate,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create report ready notification
 * @param params - Report ready parameters
 * @returns Notification object
 */
export function createReportReadyNotification(params: {
  userId: string;
  organisationId: string;
  reportName: string;
  reportType: string;
  entityId?: string;
}): Omit<Notification, '_id'> {
  return {
    type: 'report_ready',
    title: 'Report Ready',
    message: `Your ${params.reportType} report "${params.reportName}" is ready for download.`,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    entityType: 'report',
    priority: 'low',
    isRead: false,
    isActive: true,
    metadata: {
      reportName: params.reportName,
      reportType: params.reportType,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ============================================================================
// NOTIFICATION MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Generate notification summary
 * @param notifications - Array of notifications
 * @returns Notification summary
 */
export function generateNotificationSummary(notifications: Notification[]): NotificationSummary {
  const summary: NotificationSummary = {
    total: notifications.length,
    unread: 0,
    byType: {},
    byPriority: {},
    recent: notifications.slice(0, 10), // Last 10 notifications
  };

  notifications.forEach(notification => {
    if (!notification.isRead) {
      summary.unread++;
    }

    summary.byType[notification.type] = (summary.byType[notification.type] || 0) + 1;
    summary.byPriority[notification.priority] = (summary.byPriority[notification.priority] || 0) + 1;
  });

  return summary;
}

/**
 * Filter notifications based on criteria
 * @param notifications - Array of notifications
 * @param filter - Filter criteria
 * @returns Filtered notifications
 */
export function filterNotifications(notifications: Notification[], filter: NotificationFilter): Notification[] {
  return notifications.filter(notification => {
    // Filter by type
    if (filter.type && notification.type !== filter.type) return false;
    
    // Filter by priority
    if (filter.priority && notification.priority !== filter.priority) return false;
    
    // Filter by read status
    if (filter.isRead !== undefined && notification.isRead !== filter.isRead) return false;
    
    // Filter by date range
    if (filter.startDate && notification.createdAt < new Date(filter.startDate).getTime()) return false;
    if (filter.endDate && notification.createdAt > new Date(filter.endDate).getTime()) return false;
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(searchLower);
      const matchesMessage = notification.message.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesMessage) return false;
    }
    
    return true;
  });
}

/**
 * Check if notification should be sent based on settings
 * @param notification - Notification to check
 * @param settings - User notification settings
 * @returns True if notification should be sent
 */
export function shouldSendNotification(notification: Notification, settings: NotificationSettings): boolean {
  if (!settings.isActive) return false;

  // Check if notification type is enabled
  const typeEnabled = {
    'workload_alert': settings.workloadAlerts,
    'allocation_change': settings.allocationChanges,
    'system_alert': settings.systemAlerts,
    'reminder': settings.reminders,
    'report_ready': settings.reports,
    'user_activity': settings.userActivity,
  }[notification.type];

  if (!typeEnabled) return false;

  // Check quiet hours
  if (settings.quietHours.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Handle overnight quiet hours
    if (startMinutes > endMinutes) {
      if (currentTime >= startMinutes || currentTime <= endMinutes) {
        return false;
      }
    } else {
      if (currentTime >= startMinutes && currentTime <= endMinutes) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Mark notification as read
 * @param notification - Notification to mark as read
 * @returns Updated notification
 */
export function markNotificationAsRead(notification: Notification): Notification {
  return {
    ...notification,
    isRead: true,
    updatedAt: Date.now(),
  };
}

/**
 * Mark multiple notifications as read
 * @param notifications - Array of notifications to mark as read
 * @param notificationIds - Array of notification IDs to mark as read
 * @returns Updated notifications
 */
export function markNotificationsAsRead(
  notifications: Notification[],
  notificationIds: string[]
): Notification[] {
  return notifications.map(notification => {
    if (notificationIds.includes(notification._id)) {
      return markNotificationAsRead(notification);
    }
    return notification;
  });
}

/**
 * Delete notification (soft delete)
 * @param notification - Notification to delete
 * @returns Updated notification
 */
export function deleteNotification(notification: Notification): Notification {
  return {
    ...notification,
    isActive: false,
    updatedAt: Date.now(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Replace template placeholders with actual values
 * @param template - Template string
 * @param params - Parameters to replace
 * @returns String with replaced placeholders
 */
export function replaceTemplatePlaceholders(
  template: string,
  params: Record<string, any>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Format notification timestamp for display
 * @param timestamp - Timestamp to format
 * @returns Formatted timestamp string
 */
export function formatNotificationTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Get notification type label
 * @param type - Notification type
 * @returns Human-readable label
 */
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    workload_alert: 'Workload Alert',
    allocation_change: 'Allocation Change',
    system_alert: 'System Alert',
    reminder: 'Reminder',
    report_ready: 'Report Ready',
    user_activity: 'User Activity',
  };
  
  return labels[type] || type;
}

/**
 * Get notification priority label
 * @param priority - Notification priority
 * @returns Human-readable label
 */
export function getNotificationPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  
  return labels[priority] || priority;
}

/**
 * Get notification priority color
 * @param priority - Notification priority
 * @returns CSS color class
 */
export function getNotificationPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };
  
  return colors[priority] || 'text-gray-600';
}

/**
 * Get notification icon
 * @param type - Notification type
 * @returns Icon name
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    workload_alert: 'alert-triangle',
    allocation_change: 'users',
    system_alert: 'bell',
    reminder: 'clock',
    report_ready: 'file-text',
    user_activity: 'activity',
  };
  
  return icons[type] || 'bell';
}

/**
 * Truncate notification message
 * @param message - Message to truncate
 * @param maxLength - Maximum length
 * @returns Truncated message
 */
export function truncateNotificationMessage(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) return message;
  
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Group notifications by date
 * @param notifications - Array of notifications
 * @returns Grouped notifications
 */
export function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(notification);
  });
  
  return groups;
}

/**
 * Calculate notification statistics
 * @param notifications - Array of notifications
 * @returns Notification statistics
 */
export function calculateNotificationStatistics(notifications: Notification[]): {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  averagePerDay: number;
  mostActiveHour: number;
  priorityDistribution: Record<string, number>;
} {
  if (notifications.length === 0) {
    return {
      totalNotifications: 0,
      unreadCount: 0,
      readCount: 0,
      averagePerDay: 0,
      mostActiveHour: 0,
      priorityDistribution: {},
    };
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.length - unreadCount;

  // Calculate average per day
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysSinceOldest = (now - Math.min(...notifications.map(n => n.createdAt))) / oneDayMs;
  const averagePerDay = daysSinceOldest > 0 ? notifications.length / daysSinceOldest : 0;

  // Find most active hour
  const hourCounts = new Array(24).fill(0);
  notifications.forEach(notification => {
    const hour = new Date(notification.createdAt).getHours();
    hourCounts[hour]++;
  });
  const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Calculate priority distribution
  const priorityDistribution: Record<string, number> = {};
  notifications.forEach(notification => {
    priorityDistribution[notification.priority] = (priorityDistribution[notification.priority] || 0) + 1;
  });

  return {
    totalNotifications: notifications.length,
    unreadCount,
    readCount,
    averagePerDay: Math.round(averagePerDay * 100) / 100,
    mostActiveHour,
    priorityDistribution,
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const NotificationUtils = {
  // Validation
  validateNotification,
  validateNotificationSettings,
  
  // Notification Creation
  createNotificationFromTemplate,
  createWorkloadAlertNotification,
  createAllocationChangeNotification,
  createSystemAlertNotification,
  createReminderNotification,
  createReportReadyNotification,
  
  // Management
  generateNotificationSummary,
  filterNotifications,
  shouldSendNotification,
  markNotificationAsRead,
  markNotificationsAsRead,
  deleteNotification,
  
  // Utilities
  replaceTemplatePlaceholders,
  formatNotificationTimestamp,
  getNotificationTypeLabel,
  getNotificationPriorityLabel,
  getNotificationPriorityColor,
  getNotificationIcon,
  truncateNotificationMessage,
  groupNotificationsByDate,
  calculateNotificationStatistics,
};

export default NotificationUtils; 