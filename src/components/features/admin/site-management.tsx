"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Eye, AlertTriangle, X, MapPin, Building, Phone, Mail, Globe } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Site {
  _id: Id<'sites'>;
  name: string;
  code: string;
  description?: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  capacity?: number;
  facilities?: string[];
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

export default function SiteManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSiteData, setNewSiteData] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    contactEmail: "",
    contactPhone: "",
    website: "",
    capacity: 0,
    facilities: [] as string[],
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  
  // Fetch data
  const sites = useQuery('sites:getAll' as any, {}) ?? [];
  
  // Mutations
  const createSite = useMutation('sites:create' as any);
  const updateSite = useMutation('sites:update' as any);
  const deleteSite = useMutation('sites:remove' as any);

  const filteredSites = sites.filter((site: any) =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSite = async () => {
    try {
      if (!newSiteData.name || !newSiteData.code || !newSiteData.address || !newSiteData.city || !newSiteData.postcode) {
        toast.error("Please fill in all required fields");
        return;
      }

      const siteId = await createSite({
        ...newSiteData,
        facilities: newSiteData.facilities.filter(facility => facility.trim() !== ''),
      });

      toast.success("Site created successfully");
      setCreateModalOpen(false);
      setNewSiteData({
        name: "",
        code: "",
        description: "",
        address: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
        contactEmail: "",
        contactPhone: "",
        website: "",
        capacity: 0,
        facilities: [],
      });

      if (user) {
        logActivity({
          type: "create", // Change from 'action' to 'type'
          entity: "site", // Change from 'entityType' to 'entity'
          description: `Created site: ${newSiteData.name}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create site: ${error}`);
    }
  };

  const handleUpdateSite = async () => {
    if (!selectedSite) return;

    try {
      await updateSite({
        id: selectedSite._id,
        ...newSiteData,
        facilities: newSiteData.facilities.filter(facility => facility.trim() !== ''),
      });

      toast.success("Site updated successfully");
      setModalOpen(false);
      setSelectedSite(null);

      if (user) {
        logActivity({
          type: "edit", // Change from 'action' to 'type'
          entity: "site", // Change from 'entityType' to 'entity'
          description: `Updated site: ${selectedSite.name}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update site: ${error}`);
    }
  };

  const handleDeleteSite = async (siteId: Id<'sites'>, siteName: string) => {
    if (!confirm(`Are you sure you want to delete the site "${siteName}"?`)) {
      return;
    }

    try {
      await deleteSite({ id: siteId });
      toast.success("Site deleted successfully");

      if (user) {
        logActivity({
          type: "delete", // Change from 'action' to 'type'
          entity: "site", // Change from 'entityType' to 'entity'
          description: `Deleted site: ${siteName}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete site: ${error}`);
    }
  };

  const openEditModal = (site: Site) => {
    setSelectedSite(site);
    setNewSiteData({
      name: site.name,
      code: site.code,
      description: site.description || "",
      address: site.address,
      city: site.city,
      postcode: site.postcode,
      country: site.country,
      contactEmail: site.contactEmail || "",
      contactPhone: site.contactPhone || "",
      website: site.website || "",
      capacity: site.capacity || 0,
      facilities: site.facilities || [],
    });
    setModalOpen(true);
  };

  const addFacility = () => {
    setNewSiteData(prev => ({
      ...prev,
      facilities: [...prev.facilities, ""]
    }));
  };

  const removeFacility = (index: number) => {
    setNewSiteData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const updateFacility = (index: number, value: string) => {
    setNewSiteData(prev => ({
      ...prev,
      facilities: prev.facilities.map((facility, i) => i === index ? value : facility)
    }));
  };

  const getActiveSitesCount = () => {
    return sites.filter((site: any) => site.isActive).length;
  };

  const getTotalCapacity = () => {
    return sites.reduce((total: number, site: any) => total + (site.capacity || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground">
            Manage physical locations and facilities
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              All locations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveSitesCount()}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCapacity()}</div>
            <p className="text-xs text-muted-foreground">
              Combined capacity
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sites</CardTitle>
              <CardDescription>
                {filteredSites.length} sites
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site: any) => (
                <TableRow key={site._id}>
                  <TableCell className="font-medium">{site.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{site.name}</div>
                      {site.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {site.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{site.address}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {site.city}, {site.postcode}
                      </div>
                      <div className="text-muted-foreground">{site.country}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {site.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{site.contactEmail}</span>
                        </div>
                      )}
                      {site.contactPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{site.contactPhone}</span>
                        </div>
                      )}
                      {site.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-xs">{site.website}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {site.capacity ? (
                      <span className="font-medium">{site.capacity}</span>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {site.facilities && site.facilities.length > 0 ? (
                        site.facilities.slice(0, 2).map((facility: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                      {site.facilities && site.facilities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{site.facilities.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.isActive ? "default" : "secondary"}>
                      {site.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(site)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit site</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSite(site._id, site.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete site</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Site Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Site</DialogTitle>
            <DialogDescription>
              Add a new physical location to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Site Code *</Label>
                <Input
                  id="code"
                  value={newSiteData.code}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., MAIN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  value={newSiteData.name}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Campus"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSiteData.description}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the site..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={newSiteData.address}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., 123 University Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newSiteData.city}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., London"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={newSiteData.postcode}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, postcode: e.target.value }))}
                  placeholder="e.g., SW1A 1AA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newSiteData.country}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., United Kingdom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newSiteData.contactEmail}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="site@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={newSiteData.contactPhone}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newSiteData.website}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://site-website.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={newSiteData.capacity}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Facilities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFacility}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Facility
                </Button>
              </div>
              {newSiteData.facilities.map((facility: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={facility}
                    onChange={(e) => updateFacility(index, e.target.value)}
                    placeholder={`Facility ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFacility(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateSite}>Create Site</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Site Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
            <DialogDescription>
              Update site information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Site Code *</Label>
                <Input
                  id="edit-code"
                  value={newSiteData.code}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., MAIN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Site Name *</Label>
                <Input
                  id="edit-name"
                  value={newSiteData.name}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Campus"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newSiteData.description}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the site..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={newSiteData.address}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., 123 University Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City *</Label>
                <Input
                  id="edit-city"
                  value={newSiteData.city}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., London"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postcode">Postcode *</Label>
                <Input
                  id="edit-postcode"
                  value={newSiteData.postcode}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, postcode: e.target.value }))}
                  placeholder="e.g., SW1A 1AA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={newSiteData.country}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., United Kingdom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactEmail">Contact Email</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  value={newSiteData.contactEmail}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="site@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                <Input
                  id="edit-contactPhone"
                  value={newSiteData.contactPhone}
                  onChange={(e) => setNewSiteData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={newSiteData.website}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://site-website.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="0"
                value={newSiteData.capacity}
                onChange={(e) => setNewSiteData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Facilities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFacility}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Facility
                </Button>
              </div>
              {newSiteData.facilities.map((facility: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={facility}
                    onChange={(e) => updateFacility(index, e.target.value)}
                    placeholder={`Facility ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFacility(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateSite}>Update Site</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 