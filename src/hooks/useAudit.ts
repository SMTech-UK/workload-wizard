import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function useAudit() {
  const [selectedAuditId, setSelectedAuditId] = useState<Id<'audit_logs'> | null>(null);
  
  // Get all audit logs
  const auditLogs = useQuery('audit_logs:getAll' as any, {});
  
  // Get a specific audit log by ID
  const selectedAudit = useQuery(
    'audit_logs:getById' as any, 
    selectedAuditId ? { id: selectedAuditId } : "skip"
  );
  
  // Mutations
  const createAuditLog = useMutation('audit_logs:create' as any);
  
  // Get audit logs by user
  const getAuditLogsByUser = (userId: Id<'users'>) => {
    return auditLogs?.filter((log: any) => log.userId === userId) || [];
  };
  
  // Get audit logs by entity type
  const getAuditLogsByEntityType = (entityType: string) => {
    return auditLogs?.filter((log: any) => log.entityType === entityType) || [];
  };
  
  // Get audit logs by action
  const getAuditLogsByAction = (action: string) => {
    return auditLogs?.filter((log: any) => log.action === action) || [];
  };
  
  // Get audit logs by date range
  const getAuditLogsByDateRange = (startDate: Date, endDate: Date) => {
    return auditLogs?.filter((log: any) => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    }) || [];
  };
  
  // Get recent audit logs
  const getRecentAuditLogs = (limit: number = 50) => {
    return auditLogs?.slice(0, limit) || [];
  };
  
  // Search audit logs
  const searchAuditLogs = (searchTerm: string) => {
    if (!searchTerm.trim()) return auditLogs || [];
    
    const term = searchTerm.toLowerCase();
    return auditLogs?.filter((log: any) => 
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.entityType.toLowerCase().includes(term) ||
      log.userName?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Log an audit event
  const logAuditEvent = async (data: {
    action: string;
    details: string;
    entityType: string;
    entityId?: Id<any>;
    userId?: Id<'users'>;
    userName?: string;
    metadata?: any;
  }) => {
    try {
      await createAuditLog(data);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  };
  
  return {
    // Data
    auditLogs,
    selectedAudit,
    selectedAuditId,
    
    // Mutations
    createAuditLog,
    
    // Actions
    setSelectedAuditId,
    logAuditEvent,
    
    // Filtered data
    getAuditLogsByUser,
    getAuditLogsByEntityType,
    getAuditLogsByAction,
    getAuditLogsByDateRange,
    getRecentAuditLogs,
    searchAuditLogs,
    
    // Loading states
    isLoading: auditLogs === undefined,
  };
} 