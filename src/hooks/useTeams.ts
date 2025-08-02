import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function useTeams() {
  const [selectedTeamId, setSelectedTeamId] = useState<Id<'teams'> | null>(null);
  
  // Get all teams with relations
  const teams = useQuery('teams:getAllWithRelations' as any, {});
  
  // Get a specific team by ID
  const selectedTeam = useQuery(
    'teams:getById' as any, 
    selectedTeamId ? { id: selectedTeamId } : "skip"
  );
  
  // Get departments and faculties for team selection
  const departments = useQuery('departments:getAll' as any, {});
  const faculties = useQuery('faculties:getAll' as any, {});
  const userProfiles = useQuery('user_profiles:getAll' as any, {});
  
  // Mutations
  const createTeam = useMutation('teams:create' as any);
  const updateTeam = useMutation('teams:update' as any);
  const deleteTeam = useMutation('teams:remove' as any);
  
  // Get teams by department
  const getTeamsByDepartment = (departmentId: Id<'departments'>) => {
    return teams?.filter((team: any) => team.departmentId === departmentId) || [];
  };
  
  // Get teams by faculty
  const getTeamsByFaculty = (facultyId: Id<'faculties'>) => {
    return teams?.filter((team: any) => team.facultyId === facultyId) || [];
  };
  
  // Get teams by type
  const getTeamsByType = (teamType: string) => {
    return teams?.filter((team: any) => team.teamType === teamType) || [];
  };
  
  // Get teams by level
  const getTeamsByLevel = (level: string) => {
    return teams?.filter((team: any) => team.level === level) || [];
  };
  
  // Get active teams
  const getActiveTeams = () => {
    return teams?.filter((team: any) => team.isActive) || [];
  };
  
  // Get inactive teams
  const getInactiveTeams = () => {
    return teams?.filter((team: any) => !team.isActive) || [];
  };
  
  // Search teams
  const searchTeams = (searchTerm: string) => {
    if (!searchTerm.trim()) return teams || [];
    
    const term = searchTerm.toLowerCase();
    return teams?.filter((team: any) => 
      team.name.toLowerCase().includes(term) ||
      team.code.toLowerCase().includes(term) ||
      team.description?.toLowerCase().includes(term)
    ) || [];
  };
  
  // Get team type badge color
  const getTeamTypeBadgeColor = (teamType: string) => {
    switch (teamType.toLowerCase()) {
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-purple-100 text-purple-800';
      case 'research': return 'bg-green-100 text-green-800';
      case 'administrative': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return {
    // Data
    teams,
    selectedTeam,
    selectedTeamId,
    departments,
    faculties,
    userProfiles,
    
    // Mutations
    createTeam,
    updateTeam,
    deleteTeam,
    
    // Actions
    setSelectedTeamId,
    
    // Filtered data
    getTeamsByDepartment,
    getTeamsByFaculty,
    getTeamsByType,
    getTeamsByLevel,
    getActiveTeams,
    getInactiveTeams,
    searchTeams,
    
    // Utilities
    getTeamTypeBadgeColor,
    
    // Loading states
    isLoading: teams === undefined,
  };
} 