import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function useReferenceData() {
  const [selectedFacultyId, setSelectedFacultyId] = useState<Id<'faculties'> | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<Id<'departments'> | null>(null);
  const [selectedAllocationTypeId, setSelectedAllocationTypeId] = useState<Id<'allocation_types'> | null>(null);
  
  // Get all reference data
  const faculties = useQuery(api.faculties.getAll, {});
  const departments = useQuery(api.departments.getAll, {});
  const allocationTypes = useQuery(api.allocation_types.getAll, {});
  
  // Get specific items by ID
  const selectedFaculty = useQuery(
    api.faculties.getById, 
    selectedFacultyId ? { id: selectedFacultyId } : "skip"
  );
  const selectedDepartment = useQuery(
    api.departments.getById, 
    selectedDepartmentId ? { id: selectedDepartmentId } : "skip"
  );
  const selectedAllocationType = useQuery(
    api.allocation_types.getById, 
    selectedAllocationTypeId ? { id: selectedAllocationTypeId } : "skip"
  );
  
  // Mutations
  const createFaculty = useMutation(api.faculties.create);
  const updateFaculty = useMutation(api.faculties.update);
  const deleteFaculty = useMutation(api.faculties.remove);
  
  const createDepartment = useMutation(api.departments.create);
  const updateDepartment = useMutation(api.departments.update);
  const deleteDepartment = useMutation(api.departments.remove);
  
  const createAllocationType = useMutation(api.allocation_types.create);
  const updateAllocationType = useMutation(api.allocation_types.update);
  const deleteAllocationType = useMutation(api.allocation_types.remove);
  
  // Get active faculties
  const getActiveFaculties = () => {
    return faculties?.filter(faculty => faculty.isActive) || [];
  };
  
  // Get active departments
  const getActiveDepartments = () => {
    return departments?.filter(department => department.isActive) || [];
  };
  
  // Get active allocation types
  const getActiveAllocationTypes = () => {
    return allocationTypes?.filter(allocationType => allocationType.isActive) || [];
  };
  
  // Get departments by faculty
  const getDepartmentsByFaculty = (facultyId: Id<'faculties'>) => {
    return departments?.filter(department => department.facultyId === facultyId) || [];
  };
  
  // Search faculties
  const searchFaculties = (searchTerm: string) => {
    if (!searchTerm.trim()) return faculties || [];
    
    const term = searchTerm.toLowerCase();
    return faculties?.filter(faculty => 
      faculty.name.toLowerCase().includes(term) ||
      faculty.code.toLowerCase().includes(term) ||
      faculty.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Search departments
  const searchDepartments = (searchTerm: string) => {
    if (!searchTerm.trim()) return departments || [];
    
    const term = searchTerm.toLowerCase();
    return departments?.filter(department => 
      department.name.toLowerCase().includes(term) ||
      department.code.toLowerCase().includes(term) ||
      department.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Search allocation types
  const searchAllocationTypes = (searchTerm: string) => {
    if (!searchTerm.trim()) return allocationTypes || [];
    
    const term = searchTerm.toLowerCase();
    return allocationTypes?.filter(allocationType => 
      allocationType.name.toLowerCase().includes(term) ||
      allocationType.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Get faculty name by ID
  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties?.find(f => f._id === facultyId);
    return faculty?.name || "Unknown";
  };
  
  // Get department name by ID
  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments?.find(d => d._id === departmentId);
    return department?.name || "Unknown";
  };
  
  // Get allocation type name by ID
  const getAllocationTypeName = (allocationTypeId?: Id<'allocation_types'>) => {
    if (!allocationTypeId) return "Not specified";
    const allocationType = allocationTypes?.find(at => at._id === allocationTypeId);
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