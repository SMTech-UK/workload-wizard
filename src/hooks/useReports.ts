import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { useAcademicYear } from "./useAcademicYear";

export function useReports() {
  const [selectedReportId, setSelectedReportId] = useState<Id<'workload_reports'> | null>(null);
  const { currentAcademicYearId } = useAcademicYear();
  
  // Get all workload reports for current academic year
  const workloadReports = useQuery('workload_reports:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  });
  
  // Get a specific report by ID
  const selectedReport = useQuery(
    'workload_reports:getById' as any, 
    selectedReportId ? { id: selectedReportId } : "skip"
  );
  
  // Get team summaries for current academic year
  const teamSummaries = useQuery('team_summaries:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  });
  
  // Get lecturers and profiles for reporting
  const lecturers = useQuery('lecturers:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  });
  const lecturerProfiles = useQuery('lecturers:getProfiles' as any, {});
  const moduleAllocations = useQuery('module_allocations:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  });
  const adminAllocations = useQuery('admin_allocations:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  });
  
  // Mutations
  const createWorkloadReport = useMutation('workload_reports:create' as any);
  const updateWorkloadReport = useMutation('workload_reports:update' as any);
  const deleteWorkloadReport = useMutation('workload_reports:remove' as any);
  
  // Get reports by type
  const getReportsByType = (reportType: string) => {
    return workloadReports?.filter((report: any) => report.reportType === reportType) || [];
  };
  
  // Get active reports
  const getActiveReports = () => {
    return workloadReports?.filter((report: any) => report.isActive) || [];
  };
  
  // Get inactive reports
  const getInactiveReports = () => {
    return workloadReports?.filter((report: any) => !report.isActive) || [];
  };
  
  // Search reports
  const searchReports = (searchTerm: string) => {
    if (!searchTerm.trim()) return workloadReports || [];
    
    const term = searchTerm.toLowerCase();
    return workloadReports?.filter((report: any) => 
      report.reportName.toLowerCase().includes(term) ||
      report.reportType.toLowerCase().includes(term)
    ) || [];
  };
  
  // Generate lecturer workload report
  const generateLecturerWorkloadReport = () => {
    if (!lecturers || !lecturerProfiles || !moduleAllocations || !adminAllocations) {
      return [];
    }
    
    return lecturers.map((lecturer: any) => {
      const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
      const teachingHours = moduleAllocations
        .filter((ma: any) => ma.lecturerId === lecturer._id)
        .reduce((total: any, allocation: any) => total + allocation.hours, 0);
      const adminHours = adminAllocations
        .filter((aa: any) => aa.lecturerId === lecturer._id)
        .reduce((total: any, allocation: any) => total + allocation.hours, 0);
      
      const totalAllocated = lecturer.totalAllocated;
      const capacity = profile?.capacity || 0;
      const workloadPercentage = capacity > 0 ? (totalAllocated / capacity) * 100 : 0;
      
      return {
        lecturerId: lecturer._id,
        profileId: lecturer.profileId,
        name: profile?.fullName || "Unknown",
        email: profile?.email || "Unknown",
        family: profile?.family || "Unknown",
        fte: profile?.fte || 0,
        capacity: capacity,
        teachingHours,
        adminHours,
        researchHours: lecturer.allocatedResearchHours,
        otherHours: lecturer.allocatedOtherHours,
        totalAllocated,
        workloadPercentage,
      };
    });
  };
  
  // Generate department summary
  const generateDepartmentSummary = () => {
    if (!lecturers || !lecturerProfiles) {
      return [];
    }
    
    const departmentData: Record<string, any> = {};
    
    lecturers.forEach((lecturer: any) => {
      const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
      const family = profile?.family || "Unknown";
      
      if (!departmentData[family]) {
        departmentData[family] = {
          name: family,
          lecturerCount: 0,
          totalFTE: 0,
          totalTeachingHours: 0,
          totalAdminHours: 0,
          totalResearchHours: 0,
          totalOtherHours: 0,
          averageWorkloadPercentage: 0
        };
      }
      
      const teachingHours = moduleAllocations
        ?.filter((ma: any) => ma.lecturerId === lecturer._id)
        .reduce((total: any, allocation: any) => total + allocation.hours, 0) || 0;
      const adminHours = adminAllocations
        ?.filter((aa: any) => aa.lecturerId === lecturer._id)
        .reduce((total: any, allocation: any) => total + allocation.hours, 0) || 0;
      
      const totalAllocated = lecturer.totalAllocated;
      const capacity = profile?.capacity || 0;
      const workloadPercentage = capacity > 0 ? (totalAllocated / capacity) * 100 : 0;
      
      departmentData[family].lecturerCount++;
      departmentData[family].totalFTE += profile?.fte || 0;
      departmentData[family].totalTeachingHours += teachingHours;
      departmentData[family].totalAdminHours += adminHours;
      departmentData[family].totalResearchHours += lecturer.allocatedResearchHours;
      departmentData[family].totalOtherHours += lecturer.allocatedOtherHours;
      departmentData[family].averageWorkloadPercentage += workloadPercentage;
    });
    
    // Calculate averages
    Object.values(departmentData).forEach((dept: any) => {
      dept.averageWorkloadPercentage = dept.lecturerCount > 0 
        ? dept.averageWorkloadPercentage / dept.lecturerCount 
        : 0;
    });
    
    return Object.values(departmentData);
  };
  
  return {
    // Data
    workloadReports,
    selectedReport,
    selectedReportId,
    teamSummaries,
    lecturers,
    lecturerProfiles,
    moduleAllocations,
    adminAllocations,
    
    // Mutations
    createWorkloadReport,
    updateWorkloadReport,
    deleteWorkloadReport,
    
    // Actions
    setSelectedReportId,
    
    // Filtered data
    getReportsByType,
    getActiveReports,
    getInactiveReports,
    searchReports,
    
    // Report generation
    generateLecturerWorkloadReport,
    generateDepartmentSummary,
    
    // Loading states
    isLoading: workloadReports === undefined,
  };
} 