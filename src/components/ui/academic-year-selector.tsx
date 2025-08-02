"use client"

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { Calendar } from "lucide-react";

interface AcademicYearSelectorProps {
  className?: string;
  showActiveBadge?: boolean;
  onAcademicYearChange?: (academicYearId: string) => void;
}

export function AcademicYearSelector({ 
  className, 
  showActiveBadge = true,
  onAcademicYearChange 
}: AcademicYearSelectorProps) {
  const { 
    academicYears, 
    currentAcademicYear, 
    currentAcademicYearId, 
    changeAcademicYear 
  } = useAcademicYear();

  const handleAcademicYearChange = async (academicYearId: string) => {
    try {
      await changeAcademicYear(academicYearId);
      onAcademicYearChange?.(academicYearId);
    } catch (error) {
      console.error('Failed to change academic year:', error);
    }
  };

  // Function to format academic year name (e.g., "2025/26" -> "AY-25/26")
  const formatAcademicYearName = (yearName: string) => {
    // Extract the last 2 digits from each year part
    const parts = yearName.split('/');
    if (parts.length === 2) {
      const startYear = parts[0].slice(-2);
      const endYear = parts[1].slice(-2);
      return `AY-${startYear}/${endYear}`;
    }
    // Fallback to original name if format is unexpected
    return yearName;
  };

  if (!academicYears || academicYears.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Calendar className="h-4 w-4" />
        <span className="text-sm">No academic years configured</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={currentAcademicYearId || ""}
        onValueChange={handleAcademicYearChange}
      >
        <SelectTrigger className="w-auto min-w-[120px] flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {currentAcademicYear ? formatAcademicYearName(currentAcademicYear.name) : "Select AY"}
          </span>
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((year: any) => (
            <SelectItem key={year._id} value={year._id}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatAcademicYearName(year.name)}</span>
                {year.isActive && showActiveBadge && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
                {year.isStaging && (
                  <Badge variant="secondary" className="text-xs">Staging</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 