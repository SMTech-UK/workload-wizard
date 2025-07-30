// Mock Convex dataModel for testing
export type Id<T extends string> = string & { __table: T }

// Mock table types
export interface Lecturers {
  _id: Id<'lecturers'>
  fullName: string
  team: string
  specialism: string
  contract: string
  email: string
  capacity: number
  id: string
  maxTeachingHours: number
  moduleAllocations?: any[]
  role: string
  status: string
  teachingAvailability: number
  totalAllocated: number
  totalContract: number
  allocatedTeachingHours: number
  allocatedAdminHours: number
  family: string
  fte: number
}

export interface Modules {
  _id: Id<'modules'>
  name: string
  code: string
  credits: number
  level: number
  semester: number
  year: number
  department: string
  teachingHours: number
  adminHours: number
  totalHours: number
}

export interface ModuleIterations {
  _id: Id<'module_iterations'>
  moduleId: Id<'modules'>
  iteration: number
  year: number
  semester: number
  teachingHours: number
  adminHours: number
  totalHours: number
}

export interface ModuleAllocations {
  _id: Id<'module_allocations'>
  moduleId: Id<'modules'>
  lecturerId: Id<'lecturers'>
  teachingHours: number
  adminHours: number
  totalHours: number
  year: number
  semester: number
}

export interface Users {
  _id: Id<'users'>
  clerkId: string
  email: string
  firstName: string
  lastName: string
  role: string
  department: string
}

export interface Cohorts {
  _id: Id<'cohorts'>
  name: string
  year: number
  department: string
  size: number
}

export interface RecentActivity {
  _id: Id<'recent_activity'>
  userId: Id<'users'>
  action: string
  details: string
  timestamp: number
}

export interface DeptSummary {
  _id: Id<'dept_summary'>
  department: string
  totalLecturers: number
  totalModules: number
  totalHours: number
  year: number
}

export interface AdminAllocations {
  _id: Id<'admin_allocations'>
  lecturerId: Id<'lecturers'>
  adminHours: number
  year: number
  semester: number
  description: string
} 