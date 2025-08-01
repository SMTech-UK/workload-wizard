"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AllocationForm } from "@/components/forms/allocation-form";
import type { Id } from "../../convex/_generated/dataModel";

interface AllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocationId?: Id<"admin_allocations">;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AllocationModal({ open, onOpenChange, allocationId, mode = "create", onSuccess, onCancel }: AllocationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Allocation" : "Edit Allocation"}</DialogTitle>
        </DialogHeader>
        <AllocationForm
          allocationId={allocationId}
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