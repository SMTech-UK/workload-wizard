"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "@/components/forms/course-form";
import type { Id } from "../../convex/_generated/dataModel";

interface CourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: Id<"courses">;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseModal({ open, onOpenChange, courseId, mode = "create", onSuccess, onCancel }: CourseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Course" : "Edit Course"}</DialogTitle>
        </DialogHeader>
        <CourseForm
          courseId={courseId}
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