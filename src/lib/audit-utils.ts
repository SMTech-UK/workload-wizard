/**
 * Audit logging utility functions
 * 
 * Provides functions for audit trail management, logging, and analysis
 * based on the new profile-based database schema.
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AuditLog {
  _id: Id<"audit_logs">;
  type: "create" | "edit" | "delete" | "view" | "import" | "export" | "login" | "logout" | "permission_change";
  entity: string;
  description: string;
  userId: string;
  organisationId: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  formatted: string;
}

export interface AuditFilter {
  type?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalLogs: number;
  byType: Record<string, number>;
  byEntity: Record<string, number>;
  byUser: Record<string, number>;
  recentActivity: AuditLog[];
  topUsers: Array<{ userId: string; count: number }>;
  topEntities: Array<{ entity: string; count: number }>;
}

export interface AuditValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate audit log data
 * @param auditLog - Audit log data to validate
 * @returns Validation result
 */
export function validateAuditLog(auditLog: Partial<AuditLog>): AuditValidationResult {
  const result: AuditValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!auditLog.type) {
    result.errors.push("Audit type is required");
    result.isValid = false;
  }

  if (!auditLog.entity) {
    result.errors.push("Entity is required");
    result.isValid = false;
  }

  if (!auditLog.description) {
    result.errors.push("Description is required");
    result.isValid = false;
  }

  if (!auditLog.userId) {
    result.errors.push("User ID is required");
    result.isValid = false;
  }

  if (!auditLog.organisationId) {
    result.errors.push("Organisation ID is required");
    result.isValid = false;
  }

  // Validate audit type
  const validTypes = [
    "create", "edit", "delete", "view", "import", "export", 
    "login", "logout", "permission_change"
  ];
  if (auditLog.type && !validTypes.includes(auditLog.type)) {
    result.errors.push(`Invalid audit type. Must be one of: ${validTypes.join(', ')}`);
    result.isValid = false;
  }

  // Validate description length
  if (auditLog.description && auditLog.description.length > 500) {
    result.warnings.push("Description is quite long - consider a shorter description");
  }

  // Validate timestamp
  if (auditLog.timestamp && (auditLog.timestamp < 0 || auditLog.timestamp > Date.now())) {
    result.errors.push("Invalid timestamp");
    result.isValid = false;
  }

  return result;
}

// ============================================================================
// AUDIT LOGGING FUNCTIONS
// ============================================================================

/**
 * Create audit log entry
 * @param params - Audit log parameters
 * @returns Formatted audit log entry
 */
export function createAuditLog(params: {
  type: AuditLog['type'];
  entity: string;
  description: string;
  userId: string;
  organisationId: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Omit<AuditLog, '_id'> {
  const timestamp = Date.now();
  const formatted = formatAuditDescription(params);

  return {
    type: params.type,
    entity: params.entity,
    description: params.description,
    userId: params.userId,
    organisationId: params.organisationId,
    entityId: params.entityId,
    details: params.details || {},
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    timestamp,
    formatted,
  };
}

/**
 * Format audit description for display
 * @param params - Audit log parameters
 * @returns Formatted description
 */
export function formatAuditDescription(params: {
  type: string;
  entity: string;
  description: string;
  userId?: string;
}): string {
  const { type, entity, description } = params;
  
  // Capitalize entity name
  const entityLabel = entity.charAt(0).toUpperCase() + entity.slice(1).replace(/_/g, ' ');
  
  // Format based on type
  switch (type) {
    case "create":
      return `${entityLabel} created: ${description}`;
    case "edit":
      return `${entityLabel} updated: ${description}`;
    case "delete":
      return `${entityLabel} deleted: ${description}`;
    case "view":
      return `${entityLabel} viewed: ${description}`;
    case "import":
      return `Data imported: ${description}`;
    case "export":
      return `Data exported: ${description}`;
    case "login":
      return `User logged in: ${description}`;
    case "logout":
      return `User logged out: ${description}`;
    case "permission_change":
      return `Permissions changed: ${description}`;
    default:
      return `${entityLabel} ${type}: ${description}`;
  }
}

/**
 * Create audit log for entity creation
 * @param entity - Entity name
 * @param entityName - Name of the created entity
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @param entityId - Entity ID (optional)
 * @returns Audit log entry
 */
export function logEntityCreation(
  entity: string,
  entityName: string,
  userId: string,
  organisationId: string,
  entityId?: string
): Omit<AuditLog, '_id'> {
  return createAuditLog({
    type: "create",
    entity,
    description: `Created ${entityName}`,
    userId,
    organisationId,
    entityId,
  });
}

/**
 * Create audit log for entity update
 * @param entity - Entity name
 * @param entityName - Name of the updated entity
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @param entityId - Entity ID
 * @param changes - Description of changes made
 * @returns Audit log entry
 */
export function logEntityUpdate(
  entity: string,
  entityName: string,
  userId: string,
  organisationId: string,
  entityId: string,
  changes?: string
): Omit<AuditLog, '_id'> {
  const description = changes 
    ? `Updated ${entityName} (${changes})`
    : `Updated ${entityName}`;

  return createAuditLog({
    type: "edit",
    entity,
    description,
    userId,
    organisationId,
    entityId,
  });
}

/**
 * Create audit log for entity deletion
 * @param entity - Entity name
 * @param entityName - Name of the deleted entity
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @param entityId - Entity ID
 * @returns Audit log entry
 */
export function logEntityDeletion(
  entity: string,
  entityName: string,
  userId: string,
  organisationId: string,
  entityId: string
): Omit<AuditLog, '_id'> {
  return createAuditLog({
    type: "delete",
    entity,
    description: `Deleted ${entityName}`,
    userId,
    organisationId,
    entityId,
  });
}

/**
 * Create audit log for user login
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @param ipAddress - IP address (optional)
 * @param userAgent - User agent (optional)
 * @returns Audit log entry
 */
export function logUserLogin(
  userId: string,
  organisationId: string,
  ipAddress?: string,
  userAgent?: string
): Omit<AuditLog, '_id'> {
  return createAuditLog({
    type: "login",
    entity: "user_session",
    description: "User logged in",
    userId,
    organisationId,
    ipAddress,
    userAgent,
  });
}

/**
 * Create audit log for user logout
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @param ipAddress - IP address (optional)
 * @returns Audit log entry
 */
export function logUserLogout(
  userId: string,
  organisationId: string,
  ipAddress?: string
): Omit<AuditLog, '_id'> {
  return createAuditLog({
    type: "logout",
    entity: "user_session",
    description: "User logged out",
    userId,
    organisationId,
    ipAddress,
  });
}

/**
 * Create audit log for data import
 * @param importType - Type of data imported
 * @param recordCount - Number of records imported
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @returns Audit log entry
 */
export function logDataImport(
  importType: string,
  recordCount: number,
  userId: string,
  organisationId: string
): Omit<AuditLog, '_id'> {
  return createAuditLog({
    type: "import",
    entity: "data_import",
    description: `Imported ${recordCount} ${importType} records`,
    userId,
    organisationId,
    details: { importType, recordCount },
  });
}

/**
 * Create audit log for data export
 * @param exportType - Type of data exported
 * @param recordCount - Number of records exported
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @returns Audit log entry
 */
export function logDataExport(
  exportType: string,
  recordCount: number,
  userId: string,
  organisationId: string
): Omit<AuditLog, '_id'> {
  return createAuditLog({
    type: "export",
    entity: "data_export",
    description: `Exported ${recordCount} ${exportType} records`,
    userId,
    organisationId,
    details: { exportType, recordCount },
  });
}

// ============================================================================
// AUDIT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Generate audit summary from logs
 * @param logs - Array of audit logs
 * @returns Audit summary
 */
export function generateAuditSummary(logs: AuditLog[]): AuditSummary {
  const summary: AuditSummary = {
    totalLogs: logs.length,
    byType: {},
    byEntity: {},
    byUser: {},
    recentActivity: logs.slice(0, 10), // Last 10 logs
    topUsers: [],
    topEntities: [],
  };

  // Count by type, entity, and user
  logs.forEach(log => {
    summary.byType[log.type] = (summary.byType[log.type] || 0) + 1;
    summary.byEntity[log.entity] = (summary.byEntity[log.entity] || 0) + 1;
    summary.byUser[log.userId] = (summary.byUser[log.userId] || 0) + 1;
  });

  // Get top users
  const userEntries = Object.entries(summary.byUser);
  summary.topUsers = userEntries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId, count]) => ({ userId, count }));

  // Get top entities
  const entityEntries = Object.entries(summary.byEntity);
  summary.topEntities = entityEntries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([entity, count]) => ({ entity, count }));

  return summary;
}

/**
 * Filter audit logs based on criteria
 * @param logs - Array of audit logs
 * @param filter - Filter criteria
 * @returns Filtered audit logs
 */
export function filterAuditLogs(logs: AuditLog[], filter: AuditFilter): AuditLog[] {
  return logs.filter(log => {
    // Filter by type
    if (filter.type && log.type !== filter.type) return false;
    
    // Filter by entity
    if (filter.entity && log.entity !== filter.entity) return false;
    
    // Filter by user
    if (filter.userId && log.userId !== filter.userId) return false;
    
    // Filter by date range
    if (filter.startDate && log.timestamp < new Date(filter.startDate).getTime()) return false;
    if (filter.endDate && log.timestamp > new Date(filter.endDate).getTime()) return false;
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesDescription = log.description.toLowerCase().includes(searchLower);
      const matchesEntity = log.entity.toLowerCase().includes(searchLower);
      const matchesFormatted = log.formatted.toLowerCase().includes(searchLower);
      
      if (!matchesDescription && !matchesEntity && !matchesFormatted) return false;
    }
    
    return true;
  });
}

/**
 * Get audit logs with pagination
 * @param logs - Array of audit logs
 * @param page - Page number (1-based)
 * @param pageSize - Number of logs per page
 * @returns Paginated audit logs
 */
export function paginateAuditLogs(
  logs: AuditLog[],
  page: number = 1,
  pageSize: number = 20
): {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
} {
  const total = logs.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  
  const paginatedLogs = logs.slice(offset, offset + pageSize);
  
  return {
    logs: paginatedLogs,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Calculate audit statistics
 * @param logs - Array of audit logs
 * @returns Audit statistics
 */
export function calculateAuditStatistics(logs: AuditLog[]): {
  totalActions: number;
  uniqueUsers: number;
  uniqueEntities: number;
  averageActionsPerDay: number;
  mostActiveHour: number;
  mostActiveDay: string;
  recentTrend: 'increasing' | 'decreasing' | 'stable';
} {
  if (logs.length === 0) {
    return {
      totalActions: 0,
      uniqueUsers: 0,
      uniqueEntities: 0,
      averageActionsPerDay: 0,
      mostActiveHour: 0,
      mostActiveDay: 'Unknown',
      recentTrend: 'stable',
    };
  }

  const uniqueUsers = new Set(logs.map(log => log.userId)).size;
  const uniqueEntities = new Set(logs.map(log => log.entity)).size;

  // Calculate average actions per day
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysSinceOldest = (now - Math.min(...logs.map(log => log.timestamp))) / oneDayMs;
  const averageActionsPerDay = daysSinceOldest > 0 ? logs.length / daysSinceOldest : 0;

  // Find most active hour
  const hourCounts = new Array(24).fill(0);
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourCounts[hour]++;
  });
  const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Find most active day
  const dayCounts: Record<string, number> = {};
  logs.forEach(log => {
    const day = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

  // Calculate recent trend
  const recentLogs = logs.filter(log => log.timestamp > now - 7 * oneDayMs);
  const olderLogs = logs.filter(log => 
    log.timestamp <= now - 7 * oneDayMs && log.timestamp > now - 14 * oneDayMs
  );
  
  let recentTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recentLogs.length > olderLogs.length * 1.2) {
    recentTrend = 'increasing';
  } else if (recentLogs.length < olderLogs.length * 0.8) {
    recentTrend = 'decreasing';
  }

  return {
    totalActions: logs.length,
    uniqueUsers,
    uniqueEntities,
    averageActionsPerDay: Math.round(averageActionsPerDay * 100) / 100,
    mostActiveHour,
    mostActiveDay,
    recentTrend,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format audit timestamp for display
 * @param timestamp - Timestamp to format
 * @returns Formatted timestamp string
 */
export function formatAuditTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Get audit type label
 * @param type - Audit type
 * @returns Human-readable label
 */
export function getAuditTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    create: 'Created',
    edit: 'Updated',
    delete: 'Deleted',
    view: 'Viewed',
    import: 'Imported',
    export: 'Exported',
    login: 'Logged In',
    logout: 'Logged Out',
    permission_change: 'Permission Changed',
  };
  
  return labels[type] || type;
}

/**
 * Get audit severity level
 * @param type - Audit type
 * @returns Severity level
 */
export function getAuditSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    create: 'low',
    edit: 'medium',
    delete: 'high',
    view: 'low',
    import: 'medium',
    export: 'medium',
    login: 'low',
    logout: 'low',
    permission_change: 'critical',
  };
  
  return severityMap[type] || 'low';
}

/**
 * Check if audit log contains sensitive information
 * @param log - Audit log to check
 * @returns True if contains sensitive information
 */
export function containsSensitiveInformation(log: AuditLog): boolean {
  const sensitiveKeywords = [
    'password', 'token', 'key', 'secret', 'credential', 'auth',
    'login', 'logout', 'permission', 'role', 'admin'
  ];
  
  const textToCheck = `${log.description} ${log.entity} ${log.formatted}`.toLowerCase();
  
  return sensitiveKeywords.some(keyword => textToCheck.includes(keyword));
}

/**
 * Sanitize audit log for external display
 * @param log - Audit log to sanitize
 * @returns Sanitized audit log
 */
export function sanitizeAuditLog(log: AuditLog): Omit<AuditLog, '_id'> {
  const sanitized = { ...log };
  
  // Remove sensitive information
  if (containsSensitiveInformation(log)) {
    sanitized.description = '[Sensitive information redacted]';
    sanitized.formatted = '[Sensitive information redacted]';
    sanitized.details = {};
  }
  
  // Remove IP address and user agent for privacy
  delete sanitized.ipAddress;
  delete sanitized.userAgent;
  
  return sanitized;
}

/**
 * Export audit logs to CSV
 * @param logs - Array of audit logs
 * @returns CSV string
 */
export function exportAuditLogsToCSV(logs: AuditLog[]): string {
  const headers = [
    'Timestamp',
    'Type',
    'Entity',
    'Description',
    'User ID',
    'Organisation ID',
    'Entity ID',
    'Formatted',
  ];
  
  const rows = logs.map(log => [
    formatAuditTimestamp(log.timestamp),
    log.type,
    log.entity,
    log.description,
    log.userId,
    log.organisationId,
    log.entityId || '',
    log.formatted,
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const AuditUtils = {
  // Validation
  validateAuditLog,
  
  // Audit Logging
  createAuditLog,
  formatAuditDescription,
  logEntityCreation,
  logEntityUpdate,
  logEntityDeletion,
  logUserLogin,
  logUserLogout,
  logDataImport,
  logDataExport,
  
  // Analysis
  generateAuditSummary,
  filterAuditLogs,
  paginateAuditLogs,
  calculateAuditStatistics,
  
  // Utilities
  formatAuditTimestamp,
  getAuditTypeLabel,
  getAuditSeverity,
  containsSensitiveInformation,
  sanitizeAuditLog,
  exportAuditLogsToCSV,
};

export default AuditUtils; 