"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera, Check, X, User, Loader2 } from "lucide-react"

export default function Component() {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg?height=80&width=80");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    job_title: "",
    team: "",
    specialism: "",
    office_location: "",
  });
  const [tempData, setTempData] = useState(formData);

  useEffect(() => {
    setLoading(true);
    fetch("/api/user-profile")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch user profile");
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          job_title: data.user_metadata?.job_title || "",
          team: data.user_metadata?.team || "",
          specialism: data.user_metadata?.specialism || "",
          office_location: data.user_metadata?.office_location || "",
        });
        setAvatarUrl(data.picture || "/placeholder.svg?height=80&width=80");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setTempData(formData);
  }, [formData]);

  const handleEdit = () => {
    setIsEditing(true)
    setTempData(formData)
  }

  const handleSave = async () => {
    if (!profile) {
      alert("User not found. Please log in again.");
      return;
    }
    setIsEditing(false);
    try {
      const res = await fetch("/api/auth0-update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.sub,
          name: tempData.name,
          email: tempData.email,
          picture: avatarUrl,
          user_metadata: {
            job_title: tempData.job_title,
            team: tempData.team,
            specialism: tempData.specialism,
            office_location: tempData.office_location,
          },
        }),
      });
      if (res.ok) {
        const { user: updatedUser } = await res.json();
        setProfile(updatedUser);
        setFormData({
          name: updatedUser.name,
          email: updatedUser.email,
          job_title: updatedUser.user_metadata?.job_title || "",
          team: updatedUser.user_metadata?.team || "",
          specialism: updatedUser.user_metadata?.specialism || "",
          office_location: updatedUser.user_metadata?.office_location || "",
        });
        setAvatarUrl(updatedUser.picture);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Failed to update profile.");
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
        <span className="text-muted-foreground text-lg font-medium">Loading your profile, please wait...</span>
      </div>
    );
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">{error}</div>;
  }
  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">You must be logged in to view your profile.</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={isEditing ? (avatarUrl || "/placeholder.svg") : (profile.picture || "/placeholder.svg") } alt={isEditing ? tempData.name : profile.name} />
              <AvatarFallback>{getInitials(isEditing ? tempData.name : (profile.name || ""))}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={isEditing ? (avatarUrl || "/placeholder.svg") : (profile.picture || "/placeholder.svg")} alt={isEditing ? tempData.name : profile.name} />
                  <AvatarFallback className="text-lg">{getInitials(isEditing ? tempData.name : (profile.name || ""))}</AvatarFallback>
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
                <h3 className="font-semibold text-lg">{isEditing ? tempData.name : profile.name}</h3>
                <p className="text-sm text-muted-foreground">{isEditing ? tempData.email : profile.email}</p>
              </div>
            </div>

            <Separator className="mb-4" />

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={tempData.name}
                    onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
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
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={tempData.job_title}
                    onChange={(e) => setTempData({ ...tempData, job_title: e.target.value })}
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
                  <Label htmlFor="office_location">Office Location</Label>
                  <Input
                    id="office_location"
                    value={tempData.office_location}
                    onChange={(e) => setTempData({ ...tempData, office_location: e.target.value })}
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
                    <p className="text-sm font-medium mt-1">{profile.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email Address
                    </Label>
                    <p className="text-sm font-medium mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Job Title
                    </Label>
                    <p className="text-sm font-medium mt-1">{profile.user_metadata?.job_title || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Team
                    </Label>
                    <p className="text-sm font-medium mt-1">{profile.user_metadata?.team || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Specialism
                    </Label>
                    <p className="text-sm font-medium mt-1">{profile.user_metadata?.specialism || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Office Location
                    </Label>
                    <p className="text-sm font-medium mt-1">{profile.user_metadata?.office_location || '-'}</p>
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
