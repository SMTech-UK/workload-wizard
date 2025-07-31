"use client"

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAcademicYear } from "@/hooks/useAcademicYear";

export function AcademicYearTest() {
  const { 
    academicYears, 
    activeAcademicYear, 
    currentAcademicYear, 
    currentAcademicYearId 
  } = useAcademicYear();

  const createAcademicYear = useMutation(api.academic_years.create);

  const handleCreateTestYear = async () => {
    try {
      await createAcademicYear({
        name: "2025/26",
        startDate: "2025-09-01",
        endDate: "2026-08-31",
        description: "Test academic year",
        isActive: true,
        isDefault: true,
      });
    } catch (error) {
      console.error('Failed to create test academic year:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Year Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Current Academic Year</h3>
          {currentAcademicYear ? (
            <div className="flex items-center gap-2">
              <span>{currentAcademicYear.name}</span>
              {currentAcademicYear.isActive && <Badge>Active</Badge>}
              {currentAcademicYear.isDefault && <Badge variant="secondary">Default</Badge>}
            </div>
          ) : (
            <p className="text-muted-foreground">No active academic year</p>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">All Academic Years</h3>
          {academicYears && academicYears.length > 0 ? (
            <div className="space-y-2">
              {academicYears.map((year) => (
                <div key={year._id} className="flex items-center gap-2 p-2 border rounded">
                  <span>{year.name}</span>
                  {year.isActive && <Badge>Active</Badge>}
                  {year.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No academic years configured</p>
          )}
        </div>

        <Button onClick={handleCreateTestYear}>
          Create Test Academic Year
        </Button>
      </CardContent>
    </Card>
  );
} 