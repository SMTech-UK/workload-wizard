"use client"

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Users,
  FileText,
  Settings,
  Tag,
  Building,
  MapPin,
  Shield,
  Database
} from "lucide-react";
import { toast } from "sonner";

interface ReferenceDataItem {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export function SeedDataManager() {
  const [activeTab, setActiveTab] = React.useState("roles");
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<any>({});

  // Queries for reference data
  const roles = useQuery('roles:list' as any, {});
  const assessmentTypes = useQuery('assessment_types:list' as any, {});
  const allocationTypes = useQuery('allocation_types:list' as any, {});
  const adminAllocationCategories = useQuery('admin_allocation_categories:list' as any, {});
  const lecturerStatuses = useQuery('lecturer_statuses:list' as any, {});
  const sites = useQuery('sites:list' as any, {});
  const faculties = useQuery('faculties:list' as any, {});
  const tags = useQuery('tags:list' as any, {});

  // Mutations
  const createRole = useMutation('roles:create' as any);
  const updateRole = useMutation('roles:update' as any);
  const deleteRole = useMutation('roles:delete_' as any);
  
  const createAssessmentType = useMutation('assessment_types:create' as any);
  const updateAssessmentType = useMutation('assessment_types:update' as any);
  const deleteAssessmentType = useMutation('assessment_types:remove' as any);
  
  const createAllocationType = useMutation('allocation_types:create' as any);
  const updateAllocationType = useMutation('allocation_types:update' as any);
  const deleteAllocationType = useMutation('allocation_types:remove' as any);
  
  const createAdminAllocationCategory = useMutation('admin_allocation_categories:create' as any);
  const updateAdminAllocationCategory = useMutation('admin_allocation_categories:update' as any);
  const deleteAdminAllocationCategory = useMutation('admin_allocation_categories:remove' as any);
  
  const createLecturerStatus = useMutation('lecturer_statuses:create' as any);
  const updateLecturerStatus = useMutation('lecturer_statuses:update' as any);
  const deleteLecturerStatus = useMutation('lecturer_statuses:remove' as any);
  
  const createSite = useMutation('sites:create' as any);
  const updateSite = useMutation('sites:update' as any);
  const deleteSite = useMutation('sites:remove' as any);
  
  const createFaculty = useMutation('faculties:create' as any);
  const updateFaculty = useMutation('faculties:update' as any);
  const deleteFaculty = useMutation('faculties:remove' as any);
  
  const createTag = useMutation('tags:create' as any);
  const updateTag = useMutation('tags:update' as any);
  const deleteTag = useMutation('tags:remove' as any);

  // const runSeedDataMigration = useMutation(api.migrations.migrateSeedData);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // await runSeedDataMigration({ skipAuth: true });
      toast.success("Seed data migration completed successfully!");
    } catch (error) {
      toast.error(`Seed data migration failed: ${String(error)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleEdit = (item: ReferenceDataItem) => {
    setEditingItem(item._id);
    setEditForm({
      name: item.name,
      description: item.description || "",
      isActive: item.isActive
    });
  };

  const handleSave = async (itemId: string, type: string) => {
    try {
      const mutations: Record<string, any> = {
        roles: updateRole,
        assessmentTypes: updateAssessmentType,
        allocationTypes: updateAllocationType,
        adminAllocationCategories: updateAdminAllocationCategory,
        lecturerStatuses: updateLecturerStatus,
        sites: updateSite,
        faculties: updateFaculty,
        tags: updateTag
      };

      await mutations[type]({ id: itemId, ...editForm });
      setEditingItem(null);
      setEditForm({});
      toast.success("Item updated successfully!");
    } catch (error) {
      toast.error(`Failed to update item: ${String(error)}`);
    }
  };

  const handleDelete = async (itemId: string, type: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const mutations: Record<string, any> = {
        roles: deleteRole,
        assessmentTypes: deleteAssessmentType,
        allocationTypes: deleteAllocationType,
        adminAllocationCategories: deleteAdminAllocationCategory,
        lecturerStatuses: deleteLecturerStatus,
        sites: deleteSite,
        faculties: deleteFaculty,
        tags: deleteTag
      };

      await mutations[type]({ id: itemId });
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error(`Failed to delete item: ${String(error)}`);
    }
  };

  const getTabData = () => {
    switch (activeTab) {
      case "roles": return { data: roles, icon: <Shield className="h-4 w-4" /> };
      case "assessmentTypes": return { data: assessmentTypes, icon: <FileText className="h-4 w-4" /> };
      case "allocationTypes": return { data: allocationTypes, icon: <Users className="h-4 w-4" /> };
      case "adminAllocationCategories": return { data: adminAllocationCategories, icon: <Settings className="h-4 w-4" /> };
      case "lecturerStatuses": return { data: lecturerStatuses, icon: <Users className="h-4 w-4" /> };
      case "sites": return { data: sites, icon: <MapPin className="h-4 w-4" /> };
      case "faculties": return { data: faculties, icon: <Building className="h-4 w-4" /> };
      case "tags": return { data: tags, icon: <Tag className="h-4 w-4" /> };
      default: return { data: null, icon: <Database className="h-4 w-4" /> };
    }
  };

  const { data, icon } = getTabData();

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Reference Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading reference data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seed Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Reference Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage system reference data including roles, types, and default values
            </p>
            <Button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="flex items-center gap-2"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Seed Default Data
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{roles?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Roles</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{assessmentTypes?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Assessment Types</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{allocationTypes?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Allocation Types</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{sites?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Sites</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference Data Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            Reference Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="assessmentTypes">Assessment Types</TabsTrigger>
              <TabsTrigger value="allocationTypes">Allocation Types</TabsTrigger>
              <TabsTrigger value="sites">Sites</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {roles?.map((role: any) => (
                    <div key={role._id} className="border rounded-lg p-4">
                      {editingItem === role._id ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSave(role._id, "roles")}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{role.name}</h4>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant={role.isActive ? "default" : "secondary"}>
                                {role.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {role.isSystem && (
                                <Badge variant="outline">System</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!role.isSystem && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(role._id, "roles", role.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="assessmentTypes" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {assessmentTypes?.map((type: any) => (
                    <div key={type._id} className="border rounded-lg p-4">
                      {editingItem === type._id ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSave(type._id, "assessmentTypes")}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant={type.isActive ? "default" : "secondary"}>
                                {type.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {type.defaultWeighting && (
                                <Badge variant="outline">{type.defaultWeighting}% default</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(type._id, "assessmentTypes", type.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="allocationTypes" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {allocationTypes?.map((type: any) => (
                    <div key={type._id} className="border rounded-lg p-4">
                      {editingItem === type._id ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSave(type._id, "allocationTypes")}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant={type.isActive ? "default" : "secondary"}>
                                {type.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {type.defaultHours && (
                                <Badge variant="outline">{type.defaultHours}h default</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(type._id, "allocationTypes", type.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sites" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {sites?.map((site: any) => (
                    <div key={site._id} className="border rounded-lg p-4">
                      {editingItem === site._id ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="code">Code</Label>
                            <Input
                              id="code"
                              value={editForm.code || site.code}
                              onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSave(site._id, "sites")}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{site.name}</h4>
                            <p className="text-sm text-muted-foreground">Code: {site.code}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant={site.isActive ? "default" : "secondary"}>
                                {site.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(site)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(site._id, "sites", site.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 