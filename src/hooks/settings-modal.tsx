"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera, User, Settings, Bell, Shield, Palette, X, Check, BookOpen, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { updateSettings as updateSettingsUtil } from "@/lib/utils";

export type TabType = "profile" | "settings" | "general"

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: TabType;
}

export default function SettingsModal({ open, onOpenChange, initialTab = "profile" }: SettingsModalProps) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType | "lecturer-preferences">(initialTab);
  const { setTheme } = useTheme();
  React.useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);
  const [avatarUrl, setAvatarUrl] = useState(user?.imageUrl || "/placeholder.svg?height=80&width=80");
  const [isEditing, setIsEditing] = useState(false);

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

  // Fetch preferences from Convex
  const preferences = useQuery(api.users.getPreferences);
  const profileFields = useQuery(api.users.getProfileFields);
  const userSettings = useQuery(api.users.getSettings);

  // Populate lecturerPrefs from preferences when tab is opened and data is available
  React.useEffect(() => {
    if (activeTab === "lecturer-preferences" && preferences) {
      setLecturerPrefs(p => ({
        ...p,
        campus: preferences.sessionCampus || "",
        teachingTime: preferences.sessionTime || "",
        teachingDay: preferences.sessionDay || "",
        interests: preferences.interests || [],
      }));
    }
  }, [activeTab, preferences]);

  // Populate profileData from Convex when profile tab is opened and data is available, or when modal is opened
  React.useEffect(() => {
    if (open && activeTab === "profile" && profileFields) {
      setProfileData(p => ({
        ...p,
        jobTitle: profileFields.jobTitle || "",
        team: profileFields.team || "",
        specialism: profileFields.specialism || "",
      }));
    }
  }, [open, activeTab, profileFields]);

  // Populate settingsData from Convex when settings tab is opened and data is available
  React.useEffect(() => {
    if (activeTab === "settings" && userSettings) {
      setSettingsData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          email: userSettings.notifyEmail ?? true,
          push: userSettings.notifyPush ?? true,
        },
        privacy: {
          ...prev.privacy,
          profileVisible: userSettings.profilePublic ?? true,
        },
        preferences: {
          ...prev.preferences,
          theme: userSettings.theme ?? "system",
          language: userSettings.language ?? "en",
          timezone: userSettings.timezone ?? "GMT",
        },
      }));
    }
  }, [activeTab, userSettings]);

  // Sync theme with user's saved setting when settings are loaded
  React.useEffect(() => {
    if (activeTab === "settings" && userSettings && userSettings.theme) {
      setTheme(userSettings.theme);
    }
  }, [activeTab, userSettings, setTheme]);

  const storeUser = useMutation(api.users.store);
  const setPreferences = useMutation(api.users.setPreferences);
  const setSettings = useMutation(api.users.setSettings);

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
  ]

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      profileData.jobTitle !== "" ||
      profileData.team !== "" ||
      profileData.specialism !== "";
    if (!hasChanged) {
      toast("No changes detected.", { description: "Update some fields before saving." });
      return;
    }
    try {
      await storeUser({
        jobTitle: profileData.jobTitle,
        team: profileData.team,
        specialism: profileData.specialism,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
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
    setAvatarUrl(user?.imageUrl || "/placeholder.svg?height=80&width=80");
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
          <DialogTitle className="sr-only">Not Authenticated</DialogTitle>
          <DialogDescription className="sr-only">You must be logged in to view your profile.</DialogDescription>
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
                {/* In the sidebar, render the 'User Settings' divider at the very top, then the 'User Profile' button, then the 'App Settings' divider, then the 'User Settings' button. */}
                {/* Example: */}
                {/* <div className="my-4 flex items-center space-x-2"> */}
                {/*   <Separator className="flex-1" /> */}
                {/*   <span className="text-xs font-semibold text-muted-foreground px-2 whitespace-nowrap">User Settings</span> */}
                {/*   <Separator className="flex-1" /> */}
                {/* </div> */}
                {/* <button>...</button> // User Profile */}
                {/* <div className="my-4 flex items-center space-x-2"> */}
                {/*   <Separator className="flex-1" /> */}
                {/*   <span className="text-xs font-semibold text-muted-foreground px-2 whitespace-nowrap">App Settings</span> */}
                {/*   <Separator className="flex-1" /> */}
                {/* </div> */}
                {/* <button>...</button> // User Settings */}
                {/* ... existing code ... */}
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
                <button
                  onClick={() => setActiveTab('general')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === 'general' ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">General Settings</div>
                    <div className={cn("text-xs", activeTab === 'general' ? "text-primary-foreground/70" : "text-muted-foreground")}>Web app configuration</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('lecturer-preferences')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === 'lecturer-preferences' ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">Lecturer Preferences</div>
                    <div className={cn("text-xs", activeTab === 'lecturer-preferences' ? "text-primary-foreground/70" : "text-muted-foreground")}>Teaching & interests</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto max-h-[calc(80vh-32px)] p-6"> {/* 32px for padding/margins */}
                <div className="p-6">
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
                              className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                              <Camera className="h-4 w-4" />
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
                            {profileFields?.systemRole && (
                              <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border border-muted-foreground/20">
                                {profileFields.systemRole.toUpperCase()}
                              </span>
                            )}
                          </h3>
                          <p className="text-muted-foreground">{tempProfileData.email}</p>
                          {isEditing && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Click the camera icon to change your avatar
                            </p>
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
                          <Button onClick={handleSaveProfile} disabled={isSaveDisabled}>
                            <Check className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button onClick={handleCancelEdit} variant="outline">
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
                          try {
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
                            // Also persist theme to Convex user record for login persistence
                            await storeUser({ theme: settingsData.preferences.theme });
                            // Sync to Knock after saving settings
                            try {
                              await fetch('/api/knock-sync', {
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
                            } catch (err) {
                              toast.error('Failed to sync user to notifications.');
                            }
                            toast.success("Settings saved!");
                          } catch (err) {
                            toast.error("Failed to save settings.");
                          }
                        }}
                      >Save Settings</Button>
                    </div>
                  )}

                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">General Settings</h2>
                      <p className="text-muted-foreground">This is a placeholder for web app general settings.</p>
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
                              if (e.key === 'Enter' && lecturerPrefs.interestInput.trim()) {
                                setLecturerPrefs(p => ({
                                  ...p,
                                  interests: [...p.interests, p.interestInput.trim()],
                                  interestInput: "",
                                }));
                                e.preventDefault();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (lecturerPrefs.interestInput.trim()) {
                                setLecturerPrefs(p => ({
                                  ...p,
                                  interests: [...p.interests, p.interestInput.trim()],
                                  interestInput: "",
                                }));
                              }
                            }}
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
                          try {
                            await setPreferences({
                              preferences: {
                                interests: lecturerPrefs.interests,
                                sessionCampus: lecturerPrefs.campus,
                                sessionDay: lecturerPrefs.teachingDay,
                                sessionTime: lecturerPrefs.teachingTime,
                              }
                            });
                            toast.success("Lecturer preferences saved!");
                          } catch (err) {
                            toast.error("Failed to save preferences.");
                          }
                        }}
                      >Save Preferences</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  )
}
