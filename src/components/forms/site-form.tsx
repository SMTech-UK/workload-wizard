"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLogRecentActivity } from "@/hooks/useStoreUserEffect";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

// Site form schema
const siteFormSchema = z.object({
  name: z.string().min(1, "Site name is required").max(255, "Site name must be less than 255 characters"),
  code: z.string().min(1, "Site code is required").max(50, "Site code must be less than 50 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  isMainSite: z.boolean(),
  isActive: z.boolean(),
});

type SiteFormData = z.infer<typeof siteFormSchema>;

interface SiteFormProps {
  siteId?: Id<"sites">;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function SiteForm({ siteId, onSuccess, onCancel, mode = "create" }: SiteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Queries
  const selectedSite = useQuery(
    api.sites.getById,
    siteId ? { id: siteId } : "skip"
  );
  
  // Mutations
  const createSite = useMutation(api.sites.create);
  const updateSite = useMutation(api.sites.update);
  
  const logActivity = useLogRecentActivity();

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      city: "",
      isMainSite: false,
      isActive: true,
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (selectedSite && mode === "edit") {
      form.reset({
        name: selectedSite.name,
        code: selectedSite.code,
        address: selectedSite.address || "",
        city: selectedSite.city || "",
        isMainSite: selectedSite.isMainSite,
        isActive: selectedSite.isActive,
      });
    }
  }, [selectedSite, mode, form]);

  const onSubmit = async (data: SiteFormData) => {
    try {
      setIsSubmitting(true);

      const siteData = {
        name: data.name,
        code: data.code,
        address: data.address || undefined,
        city: data.city || undefined,
        isMainSite: data.isMainSite,
        isActive: data.isActive,
      };

      if (mode === "create") {
        await createSite(siteData);
        logActivity("site_created", { siteName: data.name, siteCode: data.code });
        toast.success("Site created successfully");
      } else {
        if (!siteId) {
          toast.error("Site ID is required for editing");
          return;
        }
        await updateSite({ id: siteId, ...siteData });
        logActivity("site_updated", { siteName: data.name, siteCode: data.code });
        toast.success("Site updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving site:", error);
      toast.error("Failed to save site. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Site" : "Edit Site"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Add a new physical site to the system" 
            : "Update site information and settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Main Campus"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Site Code *</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="e.g., MAIN"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="Full address of the site..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="e.g., London"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Site Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Site Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isMainSite"
                  checked={form.watch("isMainSite")}
                  onCheckedChange={(checked) => form.setValue("isMainSite", checked)}
                />
                <Label htmlFor="isMainSite">Main site</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Site is active</Label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Site" : "Update Site"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 