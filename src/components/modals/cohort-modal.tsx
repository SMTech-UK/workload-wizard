"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CohortForm } from "@/components/forms/cohort-form";
import type { Id } from "../../../convex/_generated/dataModel";

interface CohortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohortId?: Id<"cohorts">;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CohortModal({ open, onOpenChange, cohortId, mode = "create", onSuccess, onCancel }: CohortModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Cohort" : "Edit Cohort"}</DialogTitle>
        </DialogHeader>
        <CohortForm
          cohortId={cohortId}
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