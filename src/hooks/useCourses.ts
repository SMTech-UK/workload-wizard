import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function useCourses() {
  const [selectedCourseId, setSelectedCourseId] = useState<Id<'courses'> | null>(null);
  
  // Get all courses
  const courses = useQuery(api.courses.getAll, { isActive: true });
  
  // Get a specific course by ID
  const selectedCourse = useQuery(
    api.courses.getById, 
    selectedCourseId ? { id: selectedCourseId } : "skip"
  );
  
  // Mutations
  const createCourse = useMutation(api.courses.create);
  const updateCourse = useMutation(api.courses.update);
  const deleteCourse = useMutation(api.courses.remove);
  
  // Get courses by faculty
  const getCoursesByFaculty = (facultyId: Id<'faculties'>) => {
    return courses?.filter(course => course.facultyId === facultyId) || [];
  };
  
  // Get courses by department
  const getCoursesByDepartment = (departmentId: Id<'departments'>) => {
    return courses?.filter(course => course.departmentId === departmentId) || [];
  };
  
  // Get courses by level
  const getCoursesByLevel = (level: string) => {
    return courses?.filter(course => course.level === level) || [];
  };
  
  // Get active courses
  const getActiveCourses = () => {
    return courses?.filter(course => course.isActive) || [];
  };
  
  // Get inactive courses
  const getInactiveCourses = () => {
    return courses?.filter(course => !course.isActive) || [];
  };
  
  // Search courses
  const searchCourses = (searchTerm: string) => {
    if (!searchTerm.trim()) return courses || [];
    
    const term = searchTerm.toLowerCase();
    return courses?.filter(course => 
      course.name.toLowerCase().includes(term) ||
      course.code.toLowerCase().includes(term) ||
      course.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  return {
    // Data
    courses,
    selectedCourse,
    selectedCourseId,
    
    // Mutations
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Actions
    setSelectedCourseId,
    
    // Filtered data
    getCoursesByFaculty,
    getCoursesByDepartment,
    getCoursesByLevel,
    getActiveCourses,
    getInactiveCourses,
    searchCourses,
    
    // Loading states
    isLoading: courses === undefined,
  };
} 