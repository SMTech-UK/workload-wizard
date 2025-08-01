"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera, Check, X, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Id } from "../../convex/_generated/dataModel"

export default function Component() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg?height=80&width=80");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    jobTitle: "",
    team: "",
    specialism: "",
    officeLocation: "",
  });
  const [tempData, setTempData] = useState(formData);

  // Fetch user profile from Convex
  const userProfile = useQuery(api.user_profiles.getByUserId, user?.id ? { userId: user.id } : "skip");
  const updateProfile = useMutation(api.user_profiles.update);

  // Set form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        jobTitle: userProfile.jobTitle || "",
        team: userProfile.team || "",
        specialism: userProfile.specialism || "",
        officeLocation: userProfile.officeLocation || "",
      });
      setAvatarUrl(userProfile.avatarUrl || "/placeholder.svg?height=80&width=80");
    }
  }, [userProfile]);

  useEffect(() => {
    setTempData(formData);
  }, [formData]);

  useEffect(() => {
    setTempData(formData);
  }, [formData]);

  const handleEdit = () => {
    setIsEditing(true)
    setTempData(formData)
  }

  const handleSave = async () => {
    if (!userProfile) {
      toast.error("User profile not found. Please log in again.");
      return;
    }
    setIsEditing(false);
    try {
      await updateProfile({
        id: userProfile._id,
        fullName: tempData.fullName,
        email: tempData.email,
        jobTitle: tempData.jobTitle,
        team: tempData.team,
        specialism: tempData.specialism,
        officeLocation: tempData.officeLocation,
        avatarUrl: avatarUrl,
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error("Profile update error:", err);
    }
  }

  const handleCancel = () => {
    setTempData(formData)
    setIsEditing(false)
  }

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">You must be logged in to view your profile.</div>;
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
        <span className="text-muted-foreground text-lg font-medium">Loading your profile, please wait...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={isEditing ? (avatarUrl || "/placeholder.svg") : (userProfile.avatarUrl || "/placeholder.svg") } alt={isEditing ? tempData.fullName : userProfile.fullName} />
              <AvatarFallback>{getInitials(isEditing ? tempData.fullName : (userProfile.fullName || ""))}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={isEditing ? (avatarUrl || "/placeholder.svg") : (userProfile.avatarUrl || "/placeholder.svg")} alt={isEditing ? tempData.fullName : userProfile.fullName} />
                  <AvatarFallback className="text-lg">{getInitials(isEditing ? tempData.fullName : (userProfile.fullName || ""))}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
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
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{isEditing ? tempData.fullName : userProfile.fullName}</h3>
                <p className="text-sm text-muted-foreground">{isEditing ? tempData.email : userProfile.email}</p>
              </div>
            </div>

            <Separator className="mb-4" />

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={tempData.fullName}
                    onChange={(e) => setTempData({ ...tempData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={tempData.email}
                    onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={tempData.jobTitle}
                    onChange={(e) => setTempData({ ...tempData, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Lecturer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Input
                    id="team"
                    value={tempData.team}
                    onChange={(e) => setTempData({ ...tempData, team: e.target.value })}
                    placeholder="e.g. Simulation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialism">Specialism</Label>
                  <Input
                    id="specialism"
                    value={tempData.specialism}
                    onChange={(e) => setTempData({ ...tempData, specialism: e.target.value })}
                    placeholder="e.g. Paramedic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeLocation">Office Location</Label>
                  <Input
                    id="officeLocation"
                    value={tempData.officeLocation}
                    onChange={(e) => setTempData({ ...tempData, officeLocation: e.target.value })}
                    placeholder="e.g. Paragon House"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleSave} size="sm" className="flex-1" disabled={!profile}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 bg-transparent">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Full Name
                    </Label>
                    <p className="text-sm font-medium mt-1">{userProfile.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email Address
                    </Label>
                    <p className="text-sm font-medium mt-1">{userProfile.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Job Title
                    </Label>
                    <p className="text-sm font-medium mt-1">{userProfile.jobTitle || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Team
                    </Label>
                    <p className="text-sm font-medium mt-1">{userProfile.team || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Specialism
                    </Label>
                    <p className="text-sm font-medium mt-1">{userProfile.specialism || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Office Location
                    </Label>
                    <p className="text-sm font-medium mt-1">{userProfile.officeLocation || '-'}</p>
                  </div>
                </div>
                <Button onClick={handleEdit} className="w-full" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
