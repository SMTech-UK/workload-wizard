"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera, User, Settings, Bell, Shield, Palette, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabType = "profile" | "settings"

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: TabType;
}

export default function UserProfileModal({ open, onOpenChange, initialTab = "profile" }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // Reset tab when modal is opened with a new initialTab
  React.useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=80&width=80")
  const [isEditing, setIsEditing] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    bio: "Product designer passionate about creating intuitive user experiences.",
    location: "San Francisco, CA",
  })

  const [tempProfileData, setTempProfileData] = useState(profileData)

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
      timezone: "PST",
    },
  })

  const sidebarItems = [
    {
      id: "profile" as TabType,
      label: "Profile",
      icon: User,
      description: "Manage your profile information",
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: Settings,
      description: "Configure your preferences",
    },
  ]

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    setProfileData(tempProfileData)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setTempProfileData(profileData)
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const updateSettings = (category: keyof typeof settingsData, key: string, value: any) => {
    setSettingsData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] max-h-[700px] p-0">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-muted/30 border-r p-4">
              <div className="space-y-2">
                {sidebarItems.map((item) => (
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
                      <div
                        className={cn(
                          "text-xs",
                          activeTab === item.id ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">Profile</h2>
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
                            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={profileData.name} />
                            <AvatarFallback className="text-xl">{getInitials(profileData.name)}</AvatarFallback>
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
                          <h3 className="font-semibold text-lg">{profileData.name}</h3>
                          <p className="text-muted-foreground">{profileData.email}</p>
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
                            value={isEditing ? tempProfileData.name : profileData.name}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={isEditing ? tempProfileData.email : profileData.email}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, email: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={isEditing ? tempProfileData.location : profileData.location}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, location: e.target.value })}
                            disabled={!isEditing}
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={isEditing ? tempProfileData.bio : profileData.bio}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, bio: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex space-x-3 pt-4">
                          <Button onClick={handleSaveProfile}>
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
                      <div className="space-y-4">
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
                </div>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  )
}
