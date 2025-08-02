import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";

export function useAcademicYear() {
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string | null>(null);
  
  // Get all academic years
  const academicYears = useQuery('academic_years:getAll' as any);
  
  // Get the active academic year
  const activeAcademicYear = useQuery('academic_years:getActive' as any);
  
  // Mutations
  const setActiveAcademicYear = useMutation('academic_years:setActive' as any);
  
  // Set the current academic year to the active one when it loads
  useEffect(() => {
    if (activeAcademicYear) {
      setCurrentAcademicYearId(activeAcademicYear._id);
    }
  }, [activeAcademicYear]);
  
  // Get the current academic year object
  const currentAcademicYear = academicYears?.find((year: any) => year._id === currentAcademicYearId);
  
  // Function to change the current academic year
  const changeAcademicYear = async (academicYearId: string) => {
    try {
      await setActiveAcademicYear({ id: academicYearId as any });
      setCurrentAcademicYearId(academicYearId);
    } catch (error) {
      console.error('Failed to change academic year:', error);
      throw error;
    }
  };
  
  return {
    academicYears,
    activeAcademicYear,
    currentAcademicYear,
    currentAcademicYearId,
    changeAcademicYear,
    setCurrentAcademicYearId,
  };
} 