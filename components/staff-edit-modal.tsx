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
  fte: number
  totalContract: number
  family: string
  allocatedTeachingHours?: number; // Added for new fields
  maxTeachingHours?: number;
  teachingAvailability?: number;
}

interface StaffEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (staffMember: StaffMember) => void
  staffMember: StaffMember
}

// These must match the values stored in the database for contract and specialism
const careerFamilies = [
  { value: "Academic Practitioner", label: "Academic Practitioner (AP)" },
  { value: "Teaching Academic", label: "Teaching Academic (TA)" },
  { value: "Research Academic", label: "Research Academic (RA)" },
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
  { value: "Professional Lead", label: "Professional Lead" },
  { value: "Professor", label: "Professor" },
];

// Helper to get the label for a family value
function getFamilyLabel(value: string) {
  const found = careerFamilies.find(f => f.value === value);
  return found ? found.label : '';
}

// Helper to get family initials for contract
function getFamilyInitialsForContract(family: string) {
  const map: Record<string, string> = {
    'Academic Practitioner': 'AP',
    'Teaching Academic': 'TA',
    'Research Academic': 'RA',
  };
  return map[family] || family;
}

// Helper to get teaching percentage by family
function getTeachingPercentage(family: string) {
  switch (family) {
    case 'Research Academic':
      return 0.3;
    case 'Teaching Academic':
      return 0.6;
    case 'Academic Practitioner':
      return 0.8;
    default:
      return 0.6; // fallback
  }
}

export default function StaffEditModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  staffMember,
}: StaffEditModalProps) {
  const [formData, setFormData] = useState<StaffMember>(staffMember)
  const [errors, setErrors] = useState<Partial<StaffMember>>({})

  useEffect(() => {
    setFormData(staffMember);
  }, [staffMember]);

  // When FTE changes, update contract hours
  const handleFteChange = (fte: number) => {
    const totalContract = Math.round(fte * 1498 * 100) / 100;
    setFormData({ ...formData, fte, totalContract });
  };

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
      formData.role === staffMember.role &&
      formData.fte === staffMember.fte &&
      formData.totalContract === staffMember.totalContract &&
      formData.family === staffMember.family;

    if (isUnchanged) {
      toast("No changes detected. Please update at least one field before saving.");
      return;
    }

    if (!validateForm()) {
      toast("Please fill in all required fields correctly.");
      return;
    }

    // Generate contract field as smallform (e.g., 1AP, 0.6TA) and recalculate totalContract
    const roundedFte = Math.round(formData.fte * 100) / 100;
    const fteStr = Number.isInteger(roundedFte) ? String(roundedFte) : String(roundedFte).replace(/\.00$/, '');
    const familyInitials = getFamilyInitialsForContract(formData.family);
    const contractSmallForm = `${fteStr}${familyInitials}`;
    const newTotalContract = Math.floor(formData.fte * 1498);
    const teachingPct = getTeachingPercentage(formData.family);
    const newMaxTeachingHours = Math.floor(newTotalContract * teachingPct);
    // Use the current allocatedTeachingHours if present, else 0
    const allocatedTeachingHours = formData.allocatedTeachingHours ?? 0;
    const newTeachingAvailability = newMaxTeachingHours - allocatedTeachingHours;
    onSave({
      ...formData,
      contract: contractSmallForm,
      totalContract: newTotalContract,
      maxTeachingHours: newMaxTeachingHours,
      teachingAvailability: newTeachingAvailability,
    })
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
                {/* Career Family */}
                <div className="space-y-2">
                  <Label htmlFor="family" className="text-sm font-medium text-gray-700">
                    Career Family *
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <Select
                        value={formData.family}
                        onValueChange={value => setFormData({ ...formData, family: value })}
                      >
                        <SelectTrigger className={`w-full flex-1 ${errors.family ? "border-red-500" : "border-gray-300"}`} id="family">
                          <SelectValue placeholder="Select career family">
                            {getFamilyLabel(formData.family)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {careerFamilies.map(family => (
                            <SelectItem key={family.value} value={family.value}>
                              {family.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.family && <p className="text-xs text-red-500 mt-1">{errors.family}</p>}
                    </div>
                  </div>
                  {/* FTE and Contract Hours */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="fte" className="text-xs font-medium text-gray-700">FTE</Label>
                      <Input
                        id="fte"
                        type="number"
                        min={0.1}
                        step={0.01}
                        value={formData.fte}
                        onChange={e => handleFteChange(Number(e.target.value))}
                        className="w-full text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Contract Hours</Label>
                      <Input
                        value={formData.totalContract}
                        readOnly
                        className="w-full text-xs bg-gray-100 cursor-not-allowed"
                      />
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
