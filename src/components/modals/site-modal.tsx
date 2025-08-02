"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteForm } from "@/components/forms/site-form";
import type { Id } from "../../../convex/_generated/dataModel";

interface SiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId?: Id<"sites">;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SiteModal({ open, onOpenChange, siteId, mode = "create", onSuccess, onCancel }: SiteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Site" : "Edit Site"}</DialogTitle>
        </DialogHeader>
        <SiteForm
          siteId={siteId}
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