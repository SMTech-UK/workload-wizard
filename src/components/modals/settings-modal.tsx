"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, User, Settings, Bell, Shield, Palette, X, Check, BookOpen, Loader2, Info, ChevronDown, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { updateSettings as updateSettingsUtil } from "@/lib/utils";
import { useDevMode } from "@/hooks/useDevMode";
import { useAcademicYear } from "@/hooks/useAcademicYear";

export type TabType = "profile" | "settings" | "general" | "lecturer-preferences" | "developer" | "organisation-general" | "organisation-academic-years";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: TabType;
}

export default function SettingsModal({ open, onOpenChange, initialTab = "profile" }: SettingsModalProps) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { setTheme } = useTheme();
  const { devMode, isAdmin, toggleDevMode } = useDevMode();
  React.useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);
  const [avatarUrl, setAvatarUrl] = useState(user?.imageUrl || "/placeholder.svg?height=80&width=80");
  const [isEditing, setIsEditing] = useState(false);

  // Add loading states for save operations
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGeneralSettings, setIsSavingGeneralSettings] = useState(false);
  const [hasGeneralSettingsChanged, setHasGeneralSettingsChanged] = useState(false);
  const [originalGeneralSettings, setOriginalGeneralSettings] = useState({
    keyboardShortcuts: true,
    showTooltips: true,
    compactMode: false,
    landingPage: "dashboard",
    experimental: false,
  });

  // Organisation settings state
  const [organisationData, setOrganisationData] = useState({
    standardClassSize: 30,
    defaultTeachingHours: 42,
  });
  const [isSavingOrganisationSettings, setIsSavingOrganisationSettings] = useState(false);
  const [hasOrganisationSettingsChanged, setHasOrganisationSettingsChanged] = useState(false);
  const [originalOrganisationSettings, setOriginalOrganisationSettings] = useState({
    standardClassSize: 30,
    defaultTeachingHours: 42,
  });

  // Academic year management state
  const [academicYearData, setAcademicYearData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    isActive: false,
    isStaging: false,
  });

  // Function to calculate end date based on start date (academic year is roughly 1 year)
  const calculateEndDate = (startDate: string) => {
    if (!startDate) return "";
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    
    // Format as YYYY-MM-DD
    return end.toISOString().split('T')[0];
  };

  // Handle start date change and auto-calculate end date
  const handleStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate);
    setAcademicYearData(prev => ({
      ...prev,
      startDate,
      endDate,
    }));
  };
  const [isCreatingAcademicYear, setIsCreatingAcademicYear] = useState(false);
  const [isDeletingAcademicYear, setIsDeletingAcademicYear] = useState(false);
  const [isEditingAcademicYear, setIsEditingAcademicYear] = useState(false);
  const [editingAcademicYearId, setEditingAcademicYearId] = useState<string | null>(null);

  // Clerk user: only allow editing local fields, display Clerk user info
  const [profileData, setProfileData] = useState({
    jobTitle: "",
    team: "",
    specialism: "",
  });
  const [tempProfileData, setTempProfileData] = useState({
    name: user?.fullName || user?.username || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    jobTitle: profileData.jobTitle,
    team: profileData.team,
    specialism: profileData.specialism,
  });

  // Keep custom fields in sync with user.user_metadata when modal opens or user changes
  React.useEffect(() => {
    if (open && user) {
      setProfileData({
        jobTitle: "",
        team: "",
        specialism: "",
      });
      setTempProfileData(prev => ({
        ...prev,
        name: user.fullName || user.username || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [open, user]);

  // Update avatarUrl if user changes (e.g. after login)
  React.useEffect(() => {
    if (user) {
      setAvatarUrl(user.imageUrl || "/placeholder.svg?height=80&width=80");
    }
  }, [user]);

  // Clerk: settingsData is only local
  const [settingsData, setSettingsData] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: true,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showLocation: true,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "GMT",
    },
    development: {
      devMode: false,
    },
    general: {
      keyboardShortcuts: true,
      showTooltips: true,
      compactMode: false,
      landingPage: "dashboard",
      experimental: false,
    },
  });

  // Keep settingsData in sync with user.user_metadata when modal opens
  React.useEffect(() => {
    if (open) {
      setSettingsData({
        notifications: {
          email: true,
          push: false,
          marketing: true,
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          showLocation: true,
        },
        preferences: {
          theme: "system",
          language: "en",
          timezone: "GMT",
        },
        development: {
          devMode: false,
        },
        general: {
          keyboardShortcuts: true,
          showTooltips: true,
          compactMode: false,
          landingPage: "dashboard",
          experimental: false,
        },
      });
    }
  }, [open]);

  // Lecturer Preferences state
  const [lecturerPrefs, setLecturerPrefs] = useState({
    campus: "",
    teachingTime: "",
    teachingDay: "",
    interests: [] as string[],
    interestInput: "",
  });

  // Always call hooks at the top level, but handle authentication in data processing
  const preferences = useQuery(api.users.getPreferences, {});
  const profileFields = useQuery(api.users.getProfileFields, {});
  const userSettings = useQuery(api.users.getSettings, {});
  const organisationSettings = useQuery(api.organisations.get, {});
  const academicYears = useQuery(api.academic_years.getAll, {});
  const activeAcademicYear = useQuery(api.academic_years.getActive, {});
  
  // Get current academic year context
  const { currentAcademicYear } = useAcademicYear();

  // Use the data only when user is authenticated and loaded
  const safePreferences = isLoaded && user && preferences ? preferences : null;
  const safeProfileFields = isLoaded && user && profileFields ? profileFields : null;
  const safeUserSettings = isLoaded && user && userSettings ? userSettings : null;

  // Populate lecturerPrefs from preferences when tab is opened and data is available
  React.useEffect(() => {
    if (activeTab === "lecturer-preferences" && safePreferences) {
      setLecturerPrefs(p => ({
        ...p,
        campus: safePreferences.sessionCampus || "",
        teachingTime: safePreferences.sessionTime || "",
        teachingDay: safePreferences.sessionDay || "",
        interests: safePreferences.interests || [],
      }));
    }
  }, [activeTab, safePreferences]);

  // Populate profileData from Convex when profile tab is opened and data is available, or when modal is opened
  React.useEffect(() => {
    if (open && activeTab === "profile" && safeProfileFields) {
      setProfileData(p => ({
        ...p,
        jobTitle: safeProfileFields.jobTitle || "",
        team: safeProfileFields.team || "",
        specialism: safeProfileFields.specialism || "",
      }));
      setTempProfileData(prev => ({
        ...prev,
        jobTitle: safeProfileFields.jobTitle || "",
        team: safeProfileFields.team || "",
        specialism: safeProfileFields.specialism || "",
      }));
    }
  }, [open, activeTab, safeProfileFields]);

  // Populate settingsData from Convex when settings tab is opened and data is available
  React.useEffect(() => {
    if (activeTab === "settings" && safeUserSettings) {
      setSettingsData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          email: safeUserSettings.notifyEmail ?? true,
          push: safeUserSettings.notifyPush ?? true,
        },
        privacy: {
          ...prev.privacy,
          profileVisible: safeUserSettings.profilePublic ?? true,
        },
        preferences: {
          ...prev.preferences,
          theme: safeUserSettings.theme ?? "system",
          language: safeUserSettings.language ?? "en",
          timezone: safeUserSettings.timezone ?? "GMT",
        },
      }));
    }
  }, [activeTab, safeUserSettings]);

  // Populate general settings from Convex when general tab is opened and data is available
  React.useEffect(() => {
    if (activeTab === "general" && safeUserSettings) {
      const loadedGeneralSettings = {
        keyboardShortcuts: safeUserSettings.keyboardShortcuts ?? true,
        showTooltips: safeUserSettings.showTooltips ?? true,
        compactMode: safeUserSettings.compactMode ?? false,
        landingPage: safeUserSettings.landingPage ?? "dashboard",
        experimental: safeUserSettings.experimental ?? false,
      };
      
      setSettingsData(prev => ({
        ...prev,
        general: {
          ...prev.general,
          ...loadedGeneralSettings,
        },
      }));
      
      // Set original values and reset change tracking
      setOriginalGeneralSettings(loadedGeneralSettings);
      setHasGeneralSettingsChanged(false);
    }
  }, [activeTab, safeUserSettings]);

  // Populate organisation settings when organisation-general tab is opened and data is available
  React.useEffect(() => {
    if (activeTab === "organisation-general" && organisationSettings) {
      const loadedOrganisationSettings = {
        standardClassSize: organisationSettings.standardClassSize ?? 30,
        defaultTeachingHours: organisationSettings.defaultTeachingHours ?? 42,
      };
      
      setOrganisationData(prev => ({
        ...prev,
        ...loadedOrganisationSettings,
      }));
      
      // Set original values and reset change tracking
      setOriginalOrganisationSettings(loadedOrganisationSettings);
      setHasOrganisationSettingsChanged(false);
    }
  }, [activeTab, organisationSettings]);

  // Update academic year context when active academic year changes
  React.useEffect(() => {
    if (activeAcademicYear && currentAcademicYear !== activeAcademicYear._id) {
      // The academic year context will be updated by the useAcademicYear hook
    }
  }, [activeAcademicYear, currentAcademicYear]);

  // Sync theme with user's saved setting when settings are loaded
  React.useEffect(() => {
    if (activeTab === "settings" && safeUserSettings && safeUserSettings.theme) {
      setTheme(safeUserSettings.theme);
    }
  }, [activeTab, safeUserSettings, setTheme]);

  const storeUser = useMutation(api.users.store);
  const setPreferences = useMutation(api.users.setPreferences);
  const setSettings = useMutation(api.users.setSettings);
  const updateOrganisation = useMutation(api.organisations.update);
  const createAcademicYear = useMutation(api.academic_years.create);
  const updateAcademicYear = useMutation(api.academic_years.update);
  const deleteAcademicYear = useMutation(api.academic_years.remove);
  const setActiveAcademicYear = useMutation(api.academic_years.setActive);
  const setStagingAcademicYear = useMutation(api.academic_years.setStaging);

  const sidebarItems = [
    {
      id: "profile" as TabType,
      label: "User Profile",
      icon: User,
      description: "Manage your user profile information",
    },
    {
      id: "settings" as TabType,
      label: "User Settings",
      icon: Settings,
      description: "Configure your user preferences",
    },
  ];
  // Add developer tab for admins
  const appSidebarItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: "general" as TabType,
      label: "General Settings",
      icon: Settings,
      description: "Web app configuration",
    },
    {
      id: "lecturer-preferences" as TabType,
      label: "Lecturer Preferences",
      icon: BookOpen,
      description: "Teaching & interests",
    },
    // Only show Developer tab for admins
    ...(isAdmin ? [{
      id: "developer" as TabType,
      label: "Developer Settings",
      icon: Shield,
      description: "Development tools & options",
    }] : []),
  ];

  // Organisation settings items
  const organisationSidebarItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: "organisation-general" as TabType,
      label: "General",
      icon: Settings,
      description: "Organisation-wide settings",
    },
    {
      id: "organisation-academic-years" as TabType,
      label: "Academic Years",
      icon: Calendar,
      description: "Manage academic years",
    },
  ];

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size too large. Please select an image smaller than 5MB.");
      return;
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP).");
      return;
    }

    // Show message that avatar is managed through Clerk
    toast.info("Avatar management is handled through your authentication provider (Clerk). Please update your profile picture in your Clerk account settings.", {
      duration: 6000,
      description: "This ensures your avatar is consistent across all applications using this authentication system.",
    });

    // Reset the input
    event.target.value = '';
  };

  // Remove all Auth0-specific update/save logic, and only allow local editing for Clerk
  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("User not found. Please log in again.");
      return;
    }
    // Validation: Full name and email are required
    if (!tempProfileData.name.trim() || !tempProfileData.email.trim()) {
      toast.error("Full name and email address are required.");
      return;
    }
    // Validation: Only submit if something has changed
    const hasChanged =
      tempProfileData.name !== (user.fullName || user.username || "") ||
      tempProfileData.email !== (user.primaryEmailAddress?.emailAddress || "") ||
      tempProfileData.jobTitle !== profileData.jobTitle ||
      tempProfileData.team !== profileData.team ||
      tempProfileData.specialism !== profileData.specialism;
    if (!hasChanged) {
      toast("No changes detected.", { description: "Update some fields before saving." });
      return;
    }
    
    if (isSavingProfile) return; // Prevent multiple clicks
    
    setIsSavingProfile(true);
    try {
      await storeUser({
        jobTitle: profileData.jobTitle,
        team: profileData.team,
        specialism: profileData.specialism,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error("Failed to update profile.", {
        description: "Please check your connection and try again.",
        duration: 6000,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setTempProfileData(prev => ({
      ...prev,
      name: user?.fullName || user?.username || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      jobTitle: profileData.jobTitle,
      team: profileData.team,
      specialism: profileData.specialism,
    }));
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return (name || "")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateSettings = (category: keyof typeof settingsData, key: string, value: any) => {
    setSettingsData((prev) => updateSettingsUtil(prev, category, key, value));
    
    // Track changes for general settings
    if (category === "general" as keyof typeof settingsData) {
      // Check if the current settings differ from original settings
      const currentGeneral = {
        ...settingsData.general,
        [key]: value,
      };
      
      const hasChanges = Object.keys(originalGeneralSettings).some(
        (settingKey) => currentGeneral[settingKey as keyof typeof currentGeneral] !== originalGeneralSettings[settingKey as keyof typeof originalGeneralSettings]
      );
      
      setHasGeneralSettingsChanged(hasChanges);
    }
  };

  const handleUpdateOrganisationSettings = (key: string, value: any) => {
    setOrganisationData(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Track changes for organisation settings
    const currentOrganisation = {
      ...organisationData,
      [key]: value,
    };
    
    const hasChanges = Object.keys(originalOrganisationSettings).some(
      (settingKey) => currentOrganisation[settingKey as keyof typeof currentOrganisation] !== originalOrganisationSettings[settingKey as keyof typeof originalOrganisationSettings]
    );
    
    setHasOrganisationSettingsChanged(hasChanges);
  };

  // Function to start editing an academic year
  const handleStartEditAcademicYear = (year: any) => {
    setEditingAcademicYearId(year._id);
    setAcademicYearData({
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
      description: year.description || "",
      isActive: year.isActive,
      isStaging: year.isStaging,
    });
    setIsEditingAcademicYear(true);
  };

  // Function to cancel editing
  const handleCancelEditAcademicYear = () => {
    setEditingAcademicYearId(null);
    setAcademicYearData({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      isActive: false,
      isStaging: false,
    });
    setIsEditingAcademicYear(false);
  };

  // Function to save edited academic year
  const handleSaveEditAcademicYear = async () => {
    if (!editingAcademicYearId || !academicYearData.name || !academicYearData.startDate || !academicYearData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsEditingAcademicYear(true);
    try {
      await updateAcademicYear({
        id: editingAcademicYearId as any,
        name: academicYearData.name,
        startDate: academicYearData.startDate,
        endDate: academicYearData.endDate,
        description: academicYearData.description,
        isActive: academicYearData.isActive,
        isStaging: academicYearData.isStaging,
      });
      
      // Reset form
      setAcademicYearData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        isActive: false,
        isStaging: false,
      });
      setEditingAcademicYearId(null);
      setIsEditingAcademicYear(false);
      
      toast.success("Academic year updated successfully");
    } catch (error) {
      console.error('Failed to update academic year:', error);
      toast.error("Failed to update academic year");
    } finally {
      setIsEditingAcademicYear(false);
    }
  };

  // Add this function inside SettingsModal
  const addInterest = () => {
    setLecturerPrefs(prev => {
      const trimmed = prev.interestInput.trim();
      if (!trimmed || prev.interests.includes(trimmed)) return prev;
      return {
        ...prev,
        interests: [...prev.interests, trimmed],
        interestInput: "",
      };
    });
  };

  if (!isLoaded) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <DialogDescription className="sr-only">Loading user profile...</DialogDescription>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
            <span className="text-muted-foreground text-lg font-medium">Just a moment, loading your profile...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle className="sr-only">Authentication Required</DialogTitle>
          <DialogDescription className="sr-only">You must be logged in to view your profile and access this section.</DialogDescription>
          You must be logged in to view your profile.
        </DialogContent>
      </Dialog>
    );
  }

  const isSaveDisabled = isEditing && (!tempProfileData.name.trim() || !tempProfileData.email.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] max-h-[700px] p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-muted/30 border-r p-4">
              <div className="space-y-2">

                <div className="my-4 flex items-center space-x-2">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold text-muted-foreground px-2 whitespace-nowrap">User Settings</span>
                  <Separator className="flex-1" />
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === 'profile' ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">User Profile</div>
                    <div className={cn("text-xs", activeTab === 'profile' ? "text-primary-foreground/70" : "text-muted-foreground")}>Manage your user profile information</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === 'settings' ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">User Settings</div>
                    <div className={cn("text-xs", activeTab === 'settings' ? "text-primary-foreground/70" : "text-muted-foreground")}>Configure your user preferences</div>
                  </div>
                </button>
                <div className="my-4 flex items-center space-x-2">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold text-muted-foreground px-2 whitespace-nowrap">App Settings</span>
                  <Separator className="flex-1" />
                </div>
                {appSidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={cn("text-xs", activeTab === item.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{item.description}</div>
                    </div>
                  </button>
                ))}
                <div className="my-4 flex items-center space-x-2">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold text-muted-foreground px-2 whitespace-nowrap">Organisation Settings</span>
                  <Separator className="flex-1" />
                </div>
                {organisationSidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={cn("text-xs", activeTab === item.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto max-h-[calc(80vh-32px)] p-6"> {/* 32px for padding/margins */}
                {activeTab === "profile" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">User Profile</h2>
                          <p className="text-muted-foreground">Manage your profile information and avatar</p>
                        </div>
                        {!isEditing && (
                          <Button onClick={() => setIsEditing(true)} size="sm">
                            <User className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>

                      <Separator />

                      {/* Avatar Section */}
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={tempProfileData.name} />
                            <AvatarFallback className="text-xl">{getInitials(tempProfileData.name)}</AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <label
                              htmlFor="avatar-upload"
                              className="absolute -bottom-1 -right-1 bg-muted text-muted-foreground rounded-full p-2 cursor-pointer hover:bg-muted/80 transition-colors"
                              title="Avatar managed through authentication provider"
                            >
                              <Info className="h-4 w-4" />
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {tempProfileData.name}
                            {safeProfileFields && safeProfileFields.systemRole && (
                              <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border border-muted-foreground/20">
                                {safeProfileFields.systemRole.toUpperCase()}
                              </span>
                            )}
                          </h3>
                          <p className="text-muted-foreground">{tempProfileData.email}</p>
                          {isEditing && (
                            <div className="mt-1">
                              <p className="text-sm text-muted-foreground">
                                Avatar is managed through your authentication provider
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                Click the info icon for more information
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Profile Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={tempProfileData.name}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={tempProfileData.email}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, email: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input
                            id="jobTitle"
                            value={profileData.jobTitle}
                            onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Senior Lecturer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="team">Team</Label>
                          <Input
                            id="team"
                            value={profileData.team}
                            onChange={(e) => setProfileData({ ...profileData, team: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Simulation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialism">Specialism</Label>
                          <Input
                            id="specialism"
                            value={profileData.specialism}
                            onChange={(e) => setProfileData({ ...profileData, specialism: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Paramedic"
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex space-x-3 pt-4">
                          <Button 
                            onClick={handleSaveProfile} 
                            disabled={isSaveDisabled || isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={handleCancelEdit} 
                            variant="outline"
                            disabled={isSavingProfile}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-semibold">Settings</h2>
                        <p className="text-muted-foreground">Configure your account preferences and privacy settings</p>
                      </div>

                      <Separator />

                      {/* Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-5 w-5" />
                          <h3 className="text-lg font-medium">Notifications</h3>
                        </div>
                        <div className="space-y-3 pl-7">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                            </div>
                            <Switch
                              checked={settingsData.notifications.email}
                              onCheckedChange={(checked) => handleUpdateSettings("notifications", "email", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                            </div>
                            <Switch
                              checked={settingsData.notifications.push}
                              onCheckedChange={(checked) => handleUpdateSettings("notifications", "push", checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Privacy */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <h3 className="text-lg font-medium">Privacy</h3>
                        </div>
                        <div className="space-y-3 pl-7">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Public Profile</Label>
                              <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                            </div>
                            <Switch
                              checked={settingsData.privacy.profileVisible}
                              onCheckedChange={(checked) => handleUpdateSettings("privacy", "profileVisible", checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Preferences */}
                      <div className="space-y-4 pb-8">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-5 w-5" />
                          <h3 className="text-lg font-medium">Preferences</h3>
                        </div>
                        <div className="space-y-3 pl-7">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Theme</Label>
                              <Select
                                value={settingsData.preferences.theme}
                                onValueChange={(value) => {
                                  handleUpdateSettings("preferences", "theme", value);
                                  setTheme(value);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Language</Label>
                              <Select
                                value={settingsData.preferences.language}
                                onValueChange={(value) => handleUpdateSettings("preferences", "language", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Timezone</Label>
                              <Select
                                value={settingsData.preferences.timezone}
                                onValueChange={(value) => handleUpdateSettings("preferences", "timezone", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GMT">Europe/London</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (isSavingSettings) return; // Prevent multiple clicks
                          
                          setIsSavingSettings(true);
                          let settingsSaved = false;
                          let userSaved = false;
                          
                          try {
                            // Save settings to Convex
                            await setSettings({
                              settings: {
                                language: settingsData.preferences.language,
                                notifyEmail: settingsData.notifications.email,
                                notifyPush: settingsData.notifications.push,
                                profilePublic: settingsData.privacy.profileVisible,
                                theme: settingsData.preferences.theme,
                                timezone: settingsData.preferences.timezone,
                              }
                            });
                            settingsSaved = true;
                            
                            // Also persist theme to Convex user record for login persistence
                            await storeUser({ theme: settingsData.preferences.theme });
                            userSaved = true;
                            
                            // Sync to Knock after saving settings
                            try {
                              const response = await fetch('/api/knock-sync', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  id: user?.id,
                                  email: user?.primaryEmailAddress?.emailAddress,
                                  name: tempProfileData.name,
                                  avatar: user?.imageUrl,
                                  locale: settingsData.preferences.language || 'en-GB',
                                  timezone: settingsData.preferences.timezone || 'Europe/London',
                                }),
                              });
                              
                              if (!response.ok) {
                                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                              }
                              
                              toast.success("Settings saved successfully!");
                            } catch (knockError) {
                              console.error('Knock sync failed:', knockError);
                              toast.error("Settings saved but failed to sync with notifications. Your settings are saved locally.", {
                                description: "You can try again later or contact support if the issue persists.",
                                duration: 8000,
                              });
                            }
                          } catch (convexError) {
                            console.error('Convex save failed:', convexError);
                            
                            // Provide specific error messages based on what failed
                            if (!settingsSaved) {
                              toast.error("Failed to save settings to database.", {
                                description: "Please check your connection and try again.",
                                duration: 6000,
                              });
                            } else if (!userSaved) {
                              toast.error("Settings partially saved but failed to update user profile.", {
                                description: "Some settings may not be persisted. Please try again.",
                                duration: 6000,
                              });
                            }
                          } finally {
                            setIsSavingSettings(false);
                          }
                        }}
                        disabled={isSavingSettings}
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Settings"
                        )}
                      </Button>
                    </div>
                  )}

                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">General Settings</h2>
                          <p className="text-muted-foreground">Configure web app settings and general options</p>
                        </div>
                        {hasGeneralSettingsChanged && (
                          <Button
                            onClick={async () => {
                              if (isSavingGeneralSettings) return; // Prevent multiple clicks
                              
                              setIsSavingGeneralSettings(true);
                              
                              try {
                                // Save general settings to Convex
                                await setSettings({
                                  settings: {
                                    // Include existing settings that might be loaded
                                    language: settingsData.preferences.language,
                                    notifyEmail: settingsData.notifications.email,
                                    notifyPush: settingsData.notifications.push,
                                    profilePublic: settingsData.privacy.profileVisible,
                                    theme: settingsData.preferences.theme,
                                    timezone: settingsData.preferences.timezone,
                                    // Add new general settings
                                    keyboardShortcuts: settingsData.general.keyboardShortcuts,
                                    showTooltips: settingsData.general.showTooltips,
                                    compactMode: settingsData.general.compactMode,
                                    landingPage: settingsData.general.landingPage,
                                    experimental: settingsData.general.experimental,
                                  }
                                });
                                
                                toast.success("General settings saved successfully!");
                                setHasGeneralSettingsChanged(false);
                                // Update original settings to current values after successful save
                                setOriginalGeneralSettings({
                                  keyboardShortcuts: settingsData.general.keyboardShortcuts,
                                  showTooltips: settingsData.general.showTooltips,
                                  compactMode: settingsData.general.compactMode,
                                  landingPage: settingsData.general.landingPage,
                                  experimental: settingsData.general.experimental,
                                });
                              } catch (error) {
                                console.error('Failed to save general settings:', error);
                                toast.error("Failed to save general settings.", {
                                  description: "Please check your connection and try again.",
                                  duration: 6000,
                                });
                              } finally {
                                setIsSavingGeneralSettings(false);
                              }
                            }}
                            disabled={isSavingGeneralSettings}
                            size="sm"
                          >
                            {isSavingGeneralSettings ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        )}
                      </div>
                      <Separator />
                      {/* Useful General App Settings */}
                      <div className="space-y-6">
                        {/* Interface Settings */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Interface</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Enable Keyboard Shortcuts</Label>
                                <p className="text-sm text-muted-foreground">Quickly navigate and perform actions using keyboard shortcuts</p>
                              </div>
                              <Switch
                                checked={settingsData.general.keyboardShortcuts}
                                onCheckedChange={checked => handleUpdateSettings("general", "keyboardShortcuts", checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Show Tooltips</Label>
                                <p className="text-sm text-muted-foreground">Display helpful tooltips throughout the app</p>
                              </div>
                              <Switch
                                checked={settingsData.general.showTooltips}
                                onCheckedChange={checked => handleUpdateSettings("general", "showTooltips", checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Compact Mode</Label>
                                <p className="text-sm text-muted-foreground">Reduce spacing for a denser layout</p>
                              </div>
                              <Switch
                                checked={settingsData.general.compactMode}
                                onCheckedChange={checked => handleUpdateSettings("general", "compactMode", checked)}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Navigation Settings */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Navigation</h3>
                          <div className="space-y-3">
                            <div>
                              <Label>Default Landing Page</Label>
                              <p className="text-sm text-muted-foreground mb-2">Choose which page you see after login</p>
                              <Select
                                value={settingsData.general.landingPage}
                                onValueChange={value => handleUpdateSettings("general", "landingPage", value)}
                              >
                                <SelectTrigger className="w-full max-w-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dashboard">Dashboard</SelectItem>
                                  <SelectItem value="module-allocations">Module Allocations</SelectItem>
                                  <SelectItem value="lecturer-management">Lecturer Management</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Advanced Settings */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Advanced</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Enable Experimental Features</Label>
                                <p className="text-sm text-muted-foreground">Try out new features before they are released</p>
                              </div>
                              <Switch
                                checked={settingsData.general.experimental}
                                onCheckedChange={checked => handleUpdateSettings("general", "experimental", checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "developer" && isAdmin && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">Developer Settings</h2>
                          <p className="text-muted-foreground">Development tools and options for advanced users</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Development Mode</h3>
                            <p className="text-sm text-muted-foreground">
                              Enable developer tools and testing interfaces
                            </p>
                          </div>
                          <Switch
                            checked={devMode}
                            onCheckedChange={toggleDevMode}
                          />
                        </div>
                        {devMode && (
                          <Alert>
                            <AlertDescription className="text-sm">
                              Development mode is enabled. You can now access developer tools and testing interfaces.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "organisation-academic-years" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">Academic Year Management</h2>
                          <p className="text-muted-foreground">Manage academic years and their settings</p>
                        </div>
                      </div>
                      <Separator />

                      {/* Current Active Academic Year */}
                      {activeAcademicYear && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Active Academic Year</h4>
                              <p className="text-sm text-muted-foreground">{activeAcademicYear.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activeAcademicYear.startDate).toLocaleDateString()} - {new Date(activeAcademicYear.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                        </div>
                      )}

                      {/* Current Academic Year Context */}
                      {currentAcademicYear && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Current View Context</h4>
                              <p className="text-sm text-muted-foreground">
                                You are currently viewing data for: {academicYears?.find(ay => ay._id === currentAcademicYear)?.name || 'Unknown Year'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                This affects which data you see throughout the application
                              </p>
                            </div>
                            <Badge variant="outline">View Context</Badge>
                          </div>
                        </div>
                      )}

                      {/* Academic Years List */}
                      {academicYears && academicYears.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">All Academic Years</h4>
                          <div className="space-y-2">
                            {academicYears.map((year) => (
                              <div key={year._id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                                                      <div className="flex items-center gap-2">
                                      <span className="font-medium">{year.name}</span>
                                      {year.isActive && <Badge variant="default">Active</Badge>}
                                      {year.isStaging && <Badge variant="secondary">Staging</Badge>}
                                    </div>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                                  </p>
                                  {year.description && (
                                    <p className="text-xs text-muted-foreground">{year.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartEditAcademicYear(year)}
                                  >
                                    Edit
                                  </Button>
                                  {!year.isActive && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        try {
                                          await setActiveAcademicYear({ id: year._id });
                                          toast.success(`${year.name} set as active academic year`);
                                        } catch (error) {
                                          console.error('Failed to set active academic year:', error);
                                          toast.error("Failed to set active academic year");
                                        }
                                      }}
                                    >
                                      Set Active
                                    </Button>
                                  )}
                                  {!year.isStaging && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        try {
                                          await setStagingAcademicYear({ id: year._id });
                                          toast.success(`${year.name} set as staging academic year`);
                                        } catch (error) {
                                          console.error('Failed to set staging academic year:', error);
                                          toast.error("Failed to set staging academic year");
                                        }
                                      }}
                                    >
                                      Set Staging
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete the academic year "${year.name}"? This action cannot be undone.`)) {
                                        setIsDeletingAcademicYear(true);
                                        try {
                                          await deleteAcademicYear({ id: year._id });
                                          toast.success(`${year.name} deleted successfully`);
                                        } catch (error) {
                                          console.error('Failed to delete academic year:', error);
                                          toast.error("Failed to delete academic year. Make sure it has no associated data.");
                                        } finally {
                                          setIsDeletingAcademicYear(false);
                                        }
                                      }
                                    }}
                                    disabled={isDeletingAcademicYear}
                                  >
                                    {isDeletingAcademicYear ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Delete"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add/Edit Academic Year Form */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">
                          {isEditingAcademicYear ? "Edit Academic Year" : "Add New Academic Year"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="academicYearName">Academic Year Name</Label>
                            <Input
                              id="academicYearName"
                              value={academicYearData.name}
                              onChange={(e) => setAcademicYearData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., 2025/26"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="academicYearDescription">Description (Optional)</Label>
                            <Input
                              id="academicYearDescription"
                              value={academicYearData.description}
                              onChange={(e) => setAcademicYearData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="e.g., Main academic year"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="academicYearStartDate">Start Date</Label>
                            <Input
                              id="academicYearStartDate"
                              type="date"
                              value={academicYearData.startDate}
                              onChange={(e) => handleStartDateChange(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="academicYearEndDate">End Date (Auto-calculated)</Label>
                            <Input
                              id="academicYearEndDate"
                              type="date"
                              value={academicYearData.endDate}
                              onChange={(e) => setAcademicYearData(prev => ({ ...prev, endDate: e.target.value }))}
                              className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">
                              Automatically calculated as 1 year from start date
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="isActive">Set as Active Academic Year</Label>
                              <p className="text-sm text-muted-foreground">Currently active year</p>
                            </div>
                            <Switch
                              id="isActive"
                              checked={academicYearData.isActive}
                              onCheckedChange={(checked) => setAcademicYearData(prev => ({ ...prev, isActive: checked }))}
                            />
                          </div>
                                                      <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="isStaging">Set as Staging Academic Year</Label>
                                <p className="text-sm text-muted-foreground">For planning future data</p>
                              </div>
                              <Switch
                                id="isStaging"
                                checked={academicYearData.isStaging}
                                onCheckedChange={(checked) => setAcademicYearData(prev => ({ ...prev, isStaging: checked }))}
                              />
                            </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={async () => {
                              if (!academicYearData.name || !academicYearData.startDate || !academicYearData.endDate) {
                                toast.error("Please fill in all required fields");
                                return;
                              }

                              if (isEditingAcademicYear) {
                                await handleSaveEditAcademicYear();
                              } else {
                                setIsCreatingAcademicYear(true);
                                try {
                                                                  await createAcademicYear({
                                  name: academicYearData.name,
                                  startDate: academicYearData.startDate,
                                  endDate: academicYearData.endDate,
                                  description: academicYearData.description,
                                  isActive: academicYearData.isActive,
                                  isStaging: academicYearData.isStaging,
                                });
                                  
                                  // Reset form
                                  setAcademicYearData({
                                    name: "",
                                    startDate: "",
                                    endDate: "",
                                    description: "",
                                    isActive: false,
                                    isStaging: false,
                                  });
                                  
                                  toast.success("Academic year created successfully");
                                } catch (error) {
                                  console.error('Failed to create academic year:', error);
                                  toast.error("Failed to create academic year");
                                } finally {
                                  setIsCreatingAcademicYear(false);
                                }
                              }
                            }}
                            disabled={isCreatingAcademicYear || isEditingAcademicYear}
                          >
                            {isCreatingAcademicYear || isEditingAcademicYear ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isEditingAcademicYear ? "Updating..." : "Creating..."}
                              </>
                            ) : (
                              isEditingAcademicYear ? "Update Academic Year" : "Create Academic Year"
                            )}
                          </Button>
                          {isEditingAcademicYear && (
                            <Button
                              variant="outline"
                              onClick={handleCancelEditAcademicYear}
                              disabled={isCreatingAcademicYear || isEditingAcademicYear}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "lecturer-preferences" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Lecturer Preferences</h2>
                      <p className="text-muted-foreground">Set your preferences relating to working location, teaching, and interests.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="campus">Preferred Campus</Label>
                          <Input
                            id="campus"
                            value={lecturerPrefs.campus}
                            onChange={e => setLecturerPrefs(p => ({ ...p, campus: e.target.value }))}
                            placeholder="e.g. Paragon House"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teachingTime">Preferred Teaching Time</Label>
                          <Input
                            id="teachingTime"
                            value={lecturerPrefs.teachingTime}
                            onChange={e => setLecturerPrefs(p => ({ ...p, teachingTime: e.target.value }))}
                            placeholder="e.g. Morning, Afternoon"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teachingDay">Preferred Teaching Day</Label>
                          <Input
                            id="teachingDay"
                            value={lecturerPrefs.teachingDay}
                            onChange={e => setLecturerPrefs(p => ({ ...p, teachingDay: e.target.value }))}
                            placeholder="e.g. Monday, Friday"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Interests</Label>
                        <div className="flex gap-2">
                          <Input
                            value={lecturerPrefs.interestInput}
                            onChange={e => setLecturerPrefs(p => ({ ...p, interestInput: e.target.value }))}
                            placeholder="e.g. Paramedicine, Pre Hospital Care"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                addInterest();
                                e.preventDefault();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={addInterest}
                          >Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lecturerPrefs.interests.map((interest, idx) => (
                            <span key={idx} className="inline-flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                              {interest}
                              <button
                                type="button"
                                className="ml-2 text-muted-foreground hover:text-destructive"
                                onClick={() => setLecturerPrefs(p => ({
                                  ...p,
                                  interests: p.interests.filter((_, i) => i !== idx),
                                }))}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (isSavingPreferences) return; // Prevent multiple clicks
                          
                          setIsSavingPreferences(true);
                          
                          try {
                            await setPreferences({
                              preferences: {
                                interests: lecturerPrefs.interests,
                                sessionCampus: lecturerPrefs.campus,
                                sessionDay: lecturerPrefs.teachingDay,
                                sessionTime: lecturerPrefs.teachingTime,
                              }
                            });
                            toast.success("Lecturer preferences saved successfully!");
                          } catch (error) {
                            console.error('Failed to save lecturer preferences:', error);
                            toast.error("Failed to save lecturer preferences.", {
                              description: "Please check your connection and try again.",
                              duration: 6000,
                            });
                          } finally {
                            setIsSavingPreferences(false);
                          }
                        }}
                        disabled={isSavingPreferences}
                      >
                        {isSavingPreferences ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Preferences"
                        )}
                      </Button>
                    </div>
                  )}

                  {activeTab === "organisation-general" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">Organisation General Settings</h2>
                          <p className="text-muted-foreground">Configure organisation-wide settings and preferences</p>
                        </div>
                        {hasOrganisationSettingsChanged && (
                          <Button
                            onClick={async () => {
                              if (isSavingOrganisationSettings) return;
                              
                              setIsSavingOrganisationSettings(true);
                              
                              try {
                                await updateOrganisation({
                                  standardClassSize: organisationData.standardClassSize,
                                  defaultTeachingHours: organisationData.defaultTeachingHours,
                                });
                                toast.success("Organisation settings saved successfully!");
                                setHasOrganisationSettingsChanged(false);
                                // Update original settings to current values after successful save
                                setOriginalOrganisationSettings({
                                  standardClassSize: organisationData.standardClassSize,
                                  defaultTeachingHours: organisationData.defaultTeachingHours,
                                });
                              } catch (error) {
                                console.error('Failed to save organisation settings:', error);
                                toast.error("Failed to save organisation settings.", {
                                  description: "Please check your connection and try again.",
                                  duration: 6000,
                                });
                              } finally {
                                setIsSavingOrganisationSettings(false);
                              }
                            }}
                            disabled={isSavingOrganisationSettings}
                            size="sm"
                          >
                            {isSavingOrganisationSettings ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        )}
                      </div>
                      <Separator />
                      
                      {/* Standard Class Size Setting */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Standard Class Size</h3>
                          <p className="text-sm text-muted-foreground">Set the default class size used for workload calculations</p>
                        </div>
                        <div className="max-w-xs">
                          <Label htmlFor="standardClassSize">Default Class Size</Label>
                          <Input
                            id="standardClassSize"
                            type="number"
                            min="1"
                            max="500"
                            value={organisationData.standardClassSize}
                            onChange={(e) => handleUpdateOrganisationSettings("standardClassSize", parseInt(e.target.value) || 30)}
                            placeholder="30"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            This value will be used as the default for new modules and workload calculations
                          </p>
                        </div>
                      </div>

                      {/* Default Teaching Hours Setting */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Default Teaching Hours</h3>
                          <p className="text-sm text-muted-foreground">Set the default teaching hours for new module iterations</p>
                        </div>
                        <div className="max-w-xs">
                          <Label htmlFor="defaultTeachingHours">Default Teaching Hours</Label>
                          <Input
                            id="defaultTeachingHours"
                            type="number"
                            min="1"
                            max="1000"
                            value={organisationData.defaultTeachingHours}
                            onChange={(e) => handleUpdateOrganisationSettings("defaultTeachingHours", parseInt(e.target.value) || 42)}
                            placeholder="42"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            This value will be used as the default for new module iterations
                          </p>
                        </div>
                      </div>

                      <Separator />
                      
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Coming Soon - Organisation Settings
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          {/* Organisation Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Organisation Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="orgName">Organisation Name</Label>
                                <Input
                                  id="orgName"
                                  placeholder="e.g. University of Example"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="orgDomain">Primary Domain</Label>
                                <Input
                                  id="orgDomain"
                                  placeholder="e.g. example.ac.uk"
                                  disabled
                                />
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Academic Settings */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Academic Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="academicYear">Academic Year</Label>
                                <Select disabled>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select academic year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="2024-25">2024-25</SelectItem>
                                    <SelectItem value="2025-26">2025-26</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="semester">Current Semester</Label>
                                <Select disabled>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select semester" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="autumn">Autumn</SelectItem>
                                    <SelectItem value="spring">Spring</SelectItem>
                                    <SelectItem value="summer">Summer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* System Settings */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">System Settings</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Enable Module Allocations</Label>
                                  <p className="text-sm text-muted-foreground">Allow lecturers to be assigned to modules</p>
                                </div>
                                <Switch disabled checked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Enable Workload Tracking</Label>
                                  <p className="text-sm text-muted-foreground">Track and monitor academic workload</p>
                                </div>
                                <Switch disabled checked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Enable Notifications</Label>
                                  <p className="text-sm text-muted-foreground">Send notifications for workload changes</p>
                                </div>
                                <Switch disabled checked />
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Access Control */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Access Control</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Require Admin Approval</Label>
                                  <p className="text-sm text-muted-foreground">Require admin approval for major changes</p>
                                </div>
                                <Switch disabled checked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Audit Trail</Label>
                                  <p className="text-sm text-muted-foreground">Log all changes for audit purposes</p>
                                </div>
                                <Switch disabled checked />
                              </div>
                            </div>
                          </div>

                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              Organisation settings are managed by system administrators. Contact your administrator to make changes to these settings.
                            </AlertDescription>
                          </Alert>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  )
}
