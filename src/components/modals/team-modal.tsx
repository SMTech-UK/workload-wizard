"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamForm } from "@/components/forms/team-form";
import type { Id } from "../../../convex/_generated/dataModel";

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: Id<"teams">;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TeamModal({ open, onOpenChange, teamId, mode = "create", onSuccess, onCancel }: TeamModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Team" : "Edit Team"}</DialogTitle>
        </DialogHeader>
        <TeamForm
          teamId={teamId}
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