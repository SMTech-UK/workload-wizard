import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { useAcademicYear } from "./useAcademicYear";

export function useCohorts() {
  const [selectedCohortId, setSelectedCohortId] = useState<Id<'cohorts'> | null>(null);
  const { currentAcademicYearId } = useAcademicYear();
  
  // Get all cohorts for current academic year
  const cohorts = useQuery('cohorts:getAll' as any, { 
    academicYearId: currentAcademicYearId as any,
    isActive: true 
  });
  
  // Get a specific cohort by ID
  const selectedCohort = useQuery(
    'cohorts:getById' as any, 
    selectedCohortId ? { id: selectedCohortId } : "skip"
  );
  
  // Get courses for cohort selection
  const courses = useQuery('courses:getAll' as any, { isActive: true });
  
  // Mutations
  const createCohort = useMutation('cohorts:create' as any);
  const updateCohort = useMutation('cohorts:update' as any);
  const deleteCohort = useMutation('cohorts:remove' as any);
  
  // Get cohorts by course
  const getCohortsByCourse = (courseId: Id<'courses'>) => {
    return cohorts?.filter((cohort: any) => cohort.courseId === courseId) || [];
  };
  
  // Get cohorts by entry year
  const getCohortsByEntryYear = (entryYear: number) => {
    return cohorts?.filter((cohort: any) => cohort.entryYear === entryYear) || [];
  };
  
  // Get full-time cohorts
  const getFullTimeCohorts = () => {
    return cohorts?.filter((cohort: any) => cohort.isFullTime) || [];
  };
  
  // Get part-time cohorts
  const getPartTimeCohorts = () => {
    return cohorts?.filter((cohort: any) => !cohort.isFullTime) || [];
  };
  
  // Get active cohorts
  const getActiveCohorts = () => {
    return cohorts?.filter((cohort: any) => cohort.isActive) || [];
  };
  
  // Get inactive cohorts
  const getInactiveCohorts = () => {
    return cohorts?.filter((cohort: any) => !cohort.isActive) || [];
  };
  
  // Search cohorts
  const searchCohorts = (searchTerm: string) => {
    if (!searchTerm.trim()) return cohorts || [];
    
    const term = searchTerm.toLowerCase();
    return cohorts?.filter((cohort: any) => 
      cohort.name.toLowerCase().includes(term) ||
      cohort.code.toLowerCase().includes(term)
    ) || [];
  };
  
  // Get cohort status
  const getCohortStatus = (cohort: any) => {
    const now = new Date();
    const startDate = new Date(cohort.startDate);
    const endDate = new Date(cohort.endDate);
    
    if (now < startDate) return { status: "Upcoming", color: "bg-yellow-100 text-yellow-800" };
    if (now > endDate) return { status: "Completed", color: "bg-gray-100 text-gray-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };
  
  return {
    // Data
    cohorts,
    selectedCohort,
    selectedCohortId,
    courses,
    
    // Mutations
    createCohort,
    updateCohort,
    deleteCohort,
    
    // Actions
    setSelectedCohortId,
    
    // Filtered data
    getCohortsByCourse,
    getCohortsByEntryYear,
    getFullTimeCohorts,
    getPartTimeCohorts,
    getActiveCohorts,
    getInactiveCohorts,
    searchCohorts,
    
    // Utilities
    getCohortStatus,
    
    // Loading states
    isLoading: cohorts === undefined,
  };
} 