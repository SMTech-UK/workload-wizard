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
import { deepEqual, generateContractAndHours, calculateTeachingHours } from "@/lib/utils";

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
  { value: "Adult", label: "Adult" },
  { value: "Children", label: "Children" },
  { value: "Learning Disability", label: "Learning Disability" },
  { value: "Mental Health", label: "Mental Health" },
  { value: "Simulation", label: "Simulation" },
  { value: "Post-Registration", label: "Post-Registration" },
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
  isOpen,
  onClose,
  onSave,
  staffMember,
}: StaffEditModalProps) {
  const [formData, setFormData] = useState<StaffMember>(staffMember)
  const [errors, setErrors] = useState<Partial<Record<keyof StaffMember, string>>>({})

  useEffect(() => {
    // Ensure fte is always a number
    setFormData({
      ...staffMember,
      fte: staffMember.fte !== undefined && staffMember.fte !== null ? Number(staffMember.fte) : 0,
    });
  }, [staffMember]);

  // The standard annual contract hours for a full-time staff member (used for FTE calculations)
  const STANDARD_CONTRACT_HOURS = 1498; // 1498 is the standard annual contract hours for a full-time staff member

  // When FTE changes, update contract hours
  const handleFteChange = (fteStr: string) => {
    // Convert to number, use 0 if invalid
    const fte = fteStr === "" ? 0 : Number(fteStr);
    if (isNaN(fte)) return;
    const totalContract = Math.round(fte * STANDARD_CONTRACT_HOURS * 100) / 100;
    setFormData({ ...formData, fte, totalContract });
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof StaffMember, string>> = {}

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

    if (formData.fte === undefined || formData.fte === null || formData.fte <= 0) {
      newErrors.fte = "FTE is required and must be greater than 0";
    } else if (formData.fte > 1) {
      newErrors.fte = "FTE must be less than or equal to 1";
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    // Use deep equality check for change detection
    if (deepEqual(formData, staffMember)) {
      toast("No changes detected. Please update at least one field before saving.");
      return;
    }

    if (!validateForm()) {
      toast("Please fill in all required fields correctly.");
      return;
    }

    // Generate contract and total contract hours
    const { contract, totalContract } = generateContractAndHours({
      fte: formData.fte,
      family: formData.family,
      standardContractHours: STANDARD_CONTRACT_HOURS,
    });
    // Calculate teaching hours
    const { maxTeachingHours, teachingAvailability } = calculateTeachingHours({
      totalContract,
      family: formData.family,
      allocatedTeachingHours: formData.allocatedTeachingHours ?? 0,
    });
    onSave({
      ...formData,
      contract,
      totalContract,
      maxTeachingHours,
      teachingAvailability,
    });
    onClose();
  };

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
                        min={0.01}
                        max={1}
                        step={0.01}
                        value={formData.fte === 0 ? "" : formData.fte}
                        onChange={e => handleFteChange(e.target.value)}
                        className="w-full text-xs"
                      />
                      {errors.fte && <p className="text-xs text-red-500 mt-1">{errors.fte}</p>}
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
