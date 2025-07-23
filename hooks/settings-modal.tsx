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
import { Camera, User, Settings, Bell, Shield, Palette, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@auth0/nextjs-auth0";
import { toast } from "sonner";

export type TabType = "profile" | "settings" | "general"

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: TabType;
}

export default function SettingsModal({ open, onOpenChange, initialTab = "profile" }: SettingsModalProps) {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  React.useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);
  const [avatarUrl, setAvatarUrl] = useState(user?.picture || "/placeholder.svg?height=80&width=80");
  const [isEditing, setIsEditing] = useState(false);

  // Only bio/location are local fields, name/email/picture come from Auth0
  const [profileData, setProfileData] = useState({
    job_title: (user?.user_metadata?.job_title as string) || "",
    team: (user?.user_metadata?.team as string) || "",
    specialism: (user?.user_metadata?.specialism as string) || "",
    office_location: (user?.user_metadata?.office_location as string) || "",
  });
  const [tempProfileData, setTempProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    job_title: profileData.job_title,
    team: profileData.team,
    specialism: profileData.specialism,
    office_location: profileData.office_location,
  });

  // Keep custom fields in sync with user.user_metadata when modal opens or user changes
  React.useEffect(() => {
    if (open && user) {
      setProfileData({
        job_title: (user.user_metadata?.job_title as string) || "",
        team: (user.user_metadata?.team as string) || "",
        specialism: (user.user_metadata?.specialism as string) || "",
        office_location: (user.user_metadata?.office_location as string) || "",
      });
      setTempProfileData(prev => ({
        ...prev,
        job_title: (user.user_metadata?.job_title as string) || "",
        team: (user.user_metadata?.team as string) || "",
        specialism: (user.user_metadata?.specialism as string) || "",
        office_location: (user.user_metadata?.office_location as string) || "",
      }));
    }
  }, [open, user]);

  // Update avatarUrl if user changes (e.g. after login)
  React.useEffect(() => {
    if (user) {
      setAvatarUrl(user.picture || "/placeholder.svg?height=80&width=80");
    }
  }, [user]);

  const [settingsData, setSettingsData] = useState({
    notifications: user?.user_metadata?.notifications || {
      email: true,
      push: false,
      marketing: true,
    },
    privacy: user?.user_metadata?.privacy || {
      profileVisible: true,
      showEmail: false,
      showLocation: true,
    },
    preferences: user?.user_metadata?.preferences || {
      theme: "system",
      language: "en",
      timezone: "GMT",
    },
  });

  // Keep settingsData in sync with user.user_metadata when modal opens
  React.useEffect(() => {
    if (open && user) {
      setSettingsData({
        notifications: user.user_metadata?.notifications || {
          email: true,
          push: false,
          marketing: true,
        },
        privacy: user.user_metadata?.privacy || {
          profileVisible: true,
          showEmail: false,
          showLocation: true,
        },
        preferences: user.user_metadata?.preferences || {
          theme: "system",
          language: "en",
          timezone: "GMT",
        },
      });
    }
  }, [open, user]);

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
      tempProfileData.name !== (user.name || "") ||
      tempProfileData.email !== (user.email || "") ||
      avatarUrl !== (user.picture || "/placeholder.svg?height=80&width=80") ||
      tempProfileData.job_title !== ((user.user_metadata?.job_title as string) || "") ||
      tempProfileData.team !== ((user.user_metadata?.team as string) || "") ||
      tempProfileData.specialism !== ((user.user_metadata?.specialism as string) || "") ||
      tempProfileData.office_location !== ((user.user_metadata?.office_location as string) || "") ||
      JSON.stringify(settingsData.notifications) !== JSON.stringify(user.user_metadata?.notifications || {
        email: true,
        push: false,
        marketing: true,
      }) ||
      JSON.stringify(settingsData.privacy) !== JSON.stringify(user.user_metadata?.privacy || {
        profileVisible: true,
        showEmail: false,
        showLocation: true,
      }) ||
      JSON.stringify(settingsData.preferences) !== JSON.stringify(user.user_metadata?.preferences || {
        theme: "system",
        language: "en",
        timezone: "GMT",
      });
    if (!hasChanged) {
      toast("No changes detected.", { description: "Update some fields before saving." });
      return;
    }
    // Update Auth0 profile (name, email, picture, and user_metadata)
    try {
      const res = await fetch("/api/auth0-update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.sub,
          name: tempProfileData.name,
          email: tempProfileData.email,
          picture: avatarUrl,
          job_title: tempProfileData.job_title,
          team: tempProfileData.team,
          specialism: tempProfileData.specialism,
          office_location: tempProfileData.office_location,
          notifications: settingsData.notifications,
          privacy: settingsData.privacy,
          preferences: settingsData.preferences,
        }),
      });
      if (res.ok) {
        // Refetch the latest user profile from your API
        const profileRes = await fetch("/api/user-profile");
        if (profileRes.ok) {
          const updatedUser = await profileRes.json();
          setProfileData({
            job_title: updatedUser.user_metadata?.job_title || "",
            team: updatedUser.user_metadata?.team || "",
            specialism: updatedUser.user_metadata?.specialism || "",
            office_location: updatedUser.user_metadata?.office_location || "",
          });
          setTempProfileData({
            name: updatedUser.name || "",
            email: updatedUser.email || "",
            job_title: updatedUser.user_metadata?.job_title || "",
            team: updatedUser.user_metadata?.team || "",
            specialism: updatedUser.user_metadata?.specialism || "",
            office_location: updatedUser.user_metadata?.office_location || "",
          });
          setAvatarUrl(updatedUser.picture || "/placeholder.svg?height=80&width=80");
        }
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleCancelEdit = () => {
    setTempProfileData(prev => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      job_title: profileData.job_title,
      team: profileData.team,
      specialism: profileData.specialism,
      office_location: profileData.office_location,
    }));
    setAvatarUrl(user?.picture || "/placeholder.svg?height=80&width=80");
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

  const updateSettings = (category: keyof typeof settingsData, key: string, value: any) => {
    setSettingsData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <DialogDescription className="sr-only">Loading user profile...</DialogDescription>
          Loading...
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
                          <h3 className="font-semibold text-lg">{tempProfileData.name}</h3>
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
                          <Label htmlFor="job_title">Job Title</Label>
                          <Input
                            id="job_title"
                            value={tempProfileData.job_title}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, job_title: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Senior Lecturer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="team">Team</Label>
                          <Input
                            id="team"
                            value={tempProfileData.team}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, team: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Simulation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialism">Specialism</Label>
                          <Input
                            id="specialism"
                            value={tempProfileData.specialism}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, specialism: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Paramedic"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="office_location">Office Location</Label>
                          <Input
                            id="office_location"
                            value={tempProfileData.office_location}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, office_location: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g. Paragon House"
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
                              onCheckedChange={(checked) => updateSettings("notifications", "email", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                            </div>
                            <Switch
                              checked={settingsData.notifications.push}
                              onCheckedChange={(checked) => updateSettings("notifications", "push", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Marketing Emails</Label>
                              <p className="text-sm text-muted-foreground">Receive updates about new features</p>
                            </div>
                            <Switch
                              checked={settingsData.notifications.marketing}
                              onCheckedChange={(checked) => updateSettings("notifications", "marketing", checked)}
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
                              onCheckedChange={(checked) => updateSettings("privacy", "profileVisible", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Show Email</Label>
                              <p className="text-sm text-muted-foreground">Display email on public profile</p>
                            </div>
                            <Switch
                              checked={settingsData.privacy.showEmail}
                              onCheckedChange={(checked) => updateSettings("privacy", "showEmail", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Show Location</Label>
                              <p className="text-sm text-muted-foreground">Display location on public profile</p>
                            </div>
                            <Switch
                              checked={settingsData.privacy.showLocation}
                              onCheckedChange={(checked) => updateSettings("privacy", "showLocation", checked)}
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
                                onValueChange={(value) => updateSettings("preferences", "theme", value)}
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
                                onValueChange={(value) => updateSettings("preferences", "language", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Timezone</Label>
                              <Select
                                value={settingsData.preferences.timezone}
                                onValueChange={(value) => updateSettings("preferences", "timezone", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                                  <SelectItem value="GMT">Greenwich (GMT)</SelectItem>
                                  <SelectItem value="CET">Central European (CET)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">General Settings</h2>
                      <p className="text-muted-foreground">This is a placeholder for web app general settings.</p>
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
