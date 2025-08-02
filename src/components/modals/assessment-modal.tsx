"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssessmentForm } from "@/components/forms/assessment-form";
import type { Id } from "../../../convex/_generated/dataModel";

interface AssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleIterationId: Id<"module_iterations">;
  assessmentId?: Id<"module_iteration_assessments">;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssessmentModal({ open, onOpenChange, moduleIterationId, assessmentId, mode = "create", onSuccess, onCancel }: AssessmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Assessment" : "Edit Assessment"}</DialogTitle>
        </DialogHeader>
        <AssessmentForm
          moduleIterationId={moduleIterationId}
          assessmentId={assessmentId}
          mode={mode}
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
          }}
          onCancel={() => {
            onCancel?.();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}