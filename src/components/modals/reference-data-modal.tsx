"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReferenceDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export function ReferenceDataModal({ open, onOpenChange, onSuccess, onCancel, children }: ReferenceDataModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Reference Data</DialogTitle>
        </DialogHeader>
        {children ? children : <div className="text-muted-foreground">Reference data form goes here.</div>}
      </DialogContent>
    </Dialog>
  );
}