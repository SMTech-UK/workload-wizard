"use client"

import { X, User, Mail, Building, GraduationCap, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface StaffMember {
  fullName: string
  team: string
  specialism: string
  contract: string
  email: string
  role: string
}

interface StaffEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (staffMember: StaffMember) => void
  staffMember: StaffMember
}

// These must match the values stored in the database for contract and specialism
const contractTypes = [
  { value: "1AP", label: "Academic Professional (1AP)" },
  { value: "AP", label: "Academic Practitioner (AP)" },
  { value: "TA", label: "Teaching Academic (TA)" },
  { value: "RA", label: "Research Academic (RA)" },
]

const teams = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Engineering", label: "Engineering" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Physics", label: "Physics" },
  { value: "Business", label: "Business" },
  { value: "Health Sciences", label: "Health Sciences" },
]

// For specialism, allow free text entry (input instead of dropdown)
const specialisms = [
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Data Science", label: "Data Science" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Artificial Intelligence", label: "Artificial Intelligence" },
  { value: "Web Development", label: "Web Development" },
  { value: "Database Systems", label: "Database Systems" },
  { value: "Network Engineering", label: "Network Engineering" },
  { value: "Mobile Development", label: "Mobile Development" },
]

const roles = [
  { value: "Lecturer", label: "Lecturer" },
  { value: "Senior Lecturer", label: "Senior Lecturer" },
  { value: "Principal Lecturer", label: "Principal Lecturer" },
  { value: "Professional Lead", label: "Professional Lead" },
  { value: "Professor", label: "Professor" },
];

const sampleStaffMember: StaffMember = {
  fullName: "Dr. Sarah Johnson",
  team: "Computer Science",
  specialism: "Software Engineering",
  contract: "1AP",
  email: "s.johnson@university.edu",
  role: "Lecturer",
}

export default function StaffEditModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  staffMember = sampleStaffMember,
}: StaffEditModalProps) {
  const [formData, setFormData] = useState<StaffMember>(staffMember)
  const [errors, setErrors] = useState<Partial<StaffMember>>({})

  useEffect(() => {
    setFormData(staffMember);
  }, [staffMember]);

  const validateForm = () => {
    const newErrors: Partial<StaffMember> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.team) {
      newErrors.team = "Team is required"
    }

    if (!formData.specialism) {
      newErrors.specialism = "Specialism is required"
    }

    if (!formData.contract) {
      newErrors.contract = "Contract type is required"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    const isUnchanged =
      formData.fullName === staffMember.fullName &&
      formData.email === staffMember.email &&
      formData.team === staffMember.team &&
      formData.specialism === staffMember.specialism &&
      formData.contract === staffMember.contract &&
      formData.role === staffMember.role;

    if (isUnchanged) {
      toast("No changes detected. Please update at least one field before saving.");
      return;
    }

    if (!validateForm()) {
      toast("Please fill in all required fields correctly.");
      return;
    }

    onSave(formData)
    onClose()
  }

  const handleCancel = () => {
    setFormData(staffMember) // Reset to original data
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Edit Staff Profile</DialogTitle>
              <p className="text-sm text-gray-600">Update lecturer information and details</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="hover:bg-gray-200 rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edit Form Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <GraduationCap className="h-5 w-5" />
                Staff Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter full name"
                        className={`${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        className={`${errors.email ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-medium text-gray-700">
                    Team *
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <Select
                        value={formData.team}
                        onValueChange={(value) => setFormData({ ...formData, team: value })}
                      >
                        <SelectTrigger className={`${errors.team ? "border-red-500" : "border-gray-300"}`}>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.value} value={team.value}>
                              {team.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.team && <p className="text-xs text-red-500 mt-1">{errors.team}</p>}
                    </div>
                  </div>
                </div>

                {/* Specialism */}
                <div className="space-y-2">
                  <Label htmlFor="specialism" className="text-sm font-medium text-gray-700">
                    Specialism *
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="specialism"
                        value={formData.specialism}
                        onChange={e => setFormData({ ...formData, specialism: e.target.value })}
                        placeholder="Enter specialism"
                        className={`${errors.specialism ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.specialism && <p className="text-xs text-red-500 mt-1">{errors.specialism}</p>}
                    </div>
                  </div>
                </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Role *
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <Select
                          value={formData.role}
                          onValueChange={value => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger className={`w-full flex-1 ${errors.role ? "border-red-500" : "border-gray-300"}`} id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                      </div>
                    </div>
                  </div>
                  {/* Contract Type */}
                  <div className="space-y-2">
                    <Label htmlFor="contract" className="text-sm font-medium text-gray-700">
                      Contract Type *
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <Select
                          value={formData.contract}
                          onValueChange={value => setFormData({ ...formData, contract: value })}
                        >
                          <SelectTrigger className={`w-full flex-1 ${errors.contract ? "border-red-500" : "border-gray-300"}`} id="contract">
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                          <SelectContent>
                            {contractTypes.map(contract => (
                              <SelectItem key={contract.value} value={contract.value}>
                                {contract.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.contract && <p className="text-xs text-red-500 mt-1">{errors.contract}</p>}
                      </div>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" onClick={handleCancel} className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 px-6">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
