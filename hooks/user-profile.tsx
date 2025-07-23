"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera, Check, X, User } from "lucide-react"

export default function Component() {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=80&width=80")
  const [formData, setFormData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
  })
  const [tempData, setTempData] = useState(formData)

  const handleEdit = () => {
    setIsEditing(true)
    setTempData(formData)
  }

  const handleSave = () => {
    setFormData(tempData)
    setIsEditing(false)
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={formData.name} />
              <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={formData.name} />
                  <AvatarFallback className="text-lg">{getInitials(formData.name)}</AvatarFallback>
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
                <h3 className="font-semibold text-lg">{formData.name}</h3>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
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
                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleSave} size="sm" className="flex-1">
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
                    <p className="text-sm font-medium mt-1">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email Address
                    </Label>
                    <p className="text-sm font-medium mt-1">{formData.email}</p>
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
