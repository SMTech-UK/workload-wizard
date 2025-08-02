import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function useReferenceData() {
  const [selectedFacultyId, setSelectedFacultyId] = useState<Id<'faculties'> | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<Id<'departments'> | null>(null);
  const [selectedAllocationTypeId, setSelectedAllocationTypeId] = useState<Id<'allocation_types'> | null>(null);
  
  // Get all reference data
  const faculties = useQuery('faculties:getAll' as any, {});
  const departments = useQuery('departments:getAll' as any, {});
  const allocationTypes = useQuery('allocation_types:getAll' as any, {});
  
  // Get specific items by ID
  const selectedFaculty = useQuery(
    'faculties:getById' as any, 
    selectedFacultyId ? { id: selectedFacultyId } : "skip"
  );
  const selectedDepartment = useQuery(
    'departments:getById' as any, 
    selectedDepartmentId ? { id: selectedDepartmentId } : "skip"
  );
  const selectedAllocationType = useQuery(
    'allocation_types:getById' as any, 
    selectedAllocationTypeId ? { id: selectedAllocationTypeId } : "skip"
  );
  
  // Mutations
  const createFaculty = useMutation('faculties:create' as any);
  const updateFaculty = useMutation('faculties:update' as any);
  const deleteFaculty = useMutation('faculties:remove' as any);
  
  const createDepartment = useMutation('departments:create' as any);
  const updateDepartment = useMutation('departments:update' as any);
  const deleteDepartment = useMutation('departments:remove' as any);
  
  const createAllocationType = useMutation('allocation_types:create' as any);
  const updateAllocationType = useMutation('allocation_types:update' as any);
  const deleteAllocationType = useMutation('allocation_types:remove' as any);
  
  // Get active faculties
  const getActiveFaculties = () => {
    return faculties?.filter((faculty: any) => faculty.isActive) || [];
  };
  
  // Get active departments
  const getActiveDepartments = () => {
    return departments?.filter((department: any) => department.isActive) || [];
  };
  
  // Get active allocation types
  const getActiveAllocationTypes = () => {
    return allocationTypes?.filter((allocationType: any) => allocationType.isActive) || [];
  };
  
  // Get departments by faculty
  const getDepartmentsByFaculty = (facultyId: Id<'faculties'>) => {
    return departments?.filter((department: any) => department.facultyId === facultyId) || [];
  };
  
  // Search faculties
  const searchFaculties = (searchTerm: string) => {
    if (!searchTerm.trim()) return faculties || [];
    
    const term = searchTerm.toLowerCase();
    return faculties?.filter((faculty: any) => 
      faculty.name.toLowerCase().includes(term) ||
      faculty.code.toLowerCase().includes(term) ||
      faculty.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Search departments
  const searchDepartments = (searchTerm: string) => {
    if (!searchTerm.trim()) return departments || [];
    
    const term = searchTerm.toLowerCase();
    return departments?.filter((department: any) => 
      department.name.toLowerCase().includes(term) ||
      department.code.toLowerCase().includes(term) ||
      department.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Search allocation types
  const searchAllocationTypes = (searchTerm: string) => {
    if (!searchTerm.trim()) return allocationTypes || [];
    
    const term = searchTerm.toLowerCase();
    return allocationTypes?.filter((allocationType: any) => 
      allocationType.name.toLowerCase().includes(term) ||
      allocationType.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Get faculty name by ID
  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties?.find((f: any) => f._id === facultyId);
    return faculty?.name || "Unknown";
  };
  
  // Get department name by ID
  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments?.find((d: any) => d._id === departmentId);
    return department?.name || "Unknown";
  };
  
  // Get allocation type name by ID
  const getAllocationTypeName = (allocationTypeId?: Id<'allocation_types'>) => {
    if (!allocationTypeId) return "Not specified";
    const allocationType = allocationTypes?.find((at: any) => at._id === allocationTypeId);
    return allocationType?.name || "Unknown";
  };
  
  return {
    // Data
    faculties,
    departments,
    allocationTypes,
    selectedFaculty,
    selectedDepartment,
    selectedAllocationType,
    selectedFacultyId,
    selectedDepartmentId,
    selectedAllocationTypeId,
    
    // Mutations
    createFaculty,
    updateFaculty,
    deleteFaculty,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createAllocationType,
    updateAllocationType,
    deleteAllocationType,
    
    // Actions
    setSelectedFacultyId,
    setSelectedDepartmentId,
    setSelectedAllocationTypeId,
    
    // Filtered data
    getActiveFaculties,
    getActiveDepartments,
    getActiveAllocationTypes,
    getDepartmentsByFaculty,
    searchFaculties,
    searchDepartments,
    searchAllocationTypes,
    
    // Utilities
    getFacultyName,
    getDepartmentName,
    getAllocationTypeName,
    
    // Loading states
    isLoading: faculties === undefined || departments === undefined || allocationTypes === undefined,
  };
} 