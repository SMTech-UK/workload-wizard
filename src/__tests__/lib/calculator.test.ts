import { 
  totalAllocated, 
  capacity, 
  teachingAvailability, 
  adminAvailability 
} from '@/lib/calculator'

describe('calculator', () => {
  describe('totalAllocated', () => {
    it('should calculate total allocated hours correctly', () => {
      expect(totalAllocated(20, 10)).toBe(30)
      expect(totalAllocated(0, 0)).toBe(0)
      expect(totalAllocated(100, 50)).toBe(150)
    })

    it('should handle negative values', () => {
      expect(totalAllocated(-10, 20)).toBe(10)
      expect(totalAllocated(20, -10)).toBe(10)
      expect(totalAllocated(-20, -10)).toBe(-30)
    })

    it('should handle decimal values', () => {
      expect(totalAllocated(20.5, 10.5)).toBe(31)
      expect(totalAllocated(0.5, 0.3)).toBe(0.8)
    })
  })

  describe('capacity', () => {
    it('should calculate remaining capacity correctly', () => {
      expect(capacity(40, 30)).toBe(10)
      expect(capacity(1600, 1200)).toBe(400)
      expect(capacity(100, 100)).toBe(0)
    })

    it('should handle zero values', () => {
      expect(capacity(0, 0)).toBe(0)
      expect(capacity(100, 0)).toBe(100)
      expect(capacity(0, 50)).toBe(-50)
    })

    it('should handle negative capacity (over-allocation)', () => {
      expect(capacity(40, 50)).toBe(-10)
      expect(capacity(100, 150)).toBe(-50)
    })

    it('should handle decimal values', () => {
      expect(capacity(40.5, 30.2)).toBe(10.3)
      expect(capacity(100.75, 50.25)).toBe(50.5)
    })
  })

  describe('teachingAvailability', () => {
    it('should calculate teaching availability correctly', () => {
      expect(teachingAvailability(25, 20)).toBe(5)
      expect(teachingAvailability(960, 600)).toBe(360)
      expect(teachingAvailability(100, 100)).toBe(0)
    })

    it('should handle zero values', () => {
      expect(teachingAvailability(0, 0)).toBe(0)
      expect(teachingAvailability(100, 0)).toBe(100)
      expect(teachingAvailability(0, 50)).toBe(-50)
    })

    it('should handle negative availability (over-allocation)', () => {
      expect(teachingAvailability(25, 30)).toBe(-5)
      expect(teachingAvailability(100, 150)).toBe(-50)
    })

    it('should handle decimal values', () => {
      expect(teachingAvailability(25.5, 20.2)).toBeCloseTo(5.3, 10)
      expect(teachingAvailability(100.75, 50.25)).toBeCloseTo(50.5, 10)
    })
  })

  describe('adminAvailability', () => {
    it('should calculate administrative availability correctly', () => {
      expect(adminAvailability(15, 10)).toBe(5)
      expect(adminAvailability(400, 200)).toBe(200)
      expect(adminAvailability(50, 50)).toBe(0)
    })

    it('should handle zero values', () => {
      expect(adminAvailability(0, 0)).toBe(0)
      expect(adminAvailability(100, 0)).toBe(100)
      expect(adminAvailability(0, 50)).toBe(-50)
    })

    it('should handle negative availability (over-allocation)', () => {
      expect(adminAvailability(15, 20)).toBe(-5)
      expect(adminAvailability(100, 150)).toBe(-50)
    })

    it('should handle decimal values', () => {
      expect(adminAvailability(15.5, 10.2)).toBeCloseTo(5.3, 10)
      expect(adminAvailability(100.75, 50.25)).toBeCloseTo(50.5, 10)
    })
  })

  describe('integration scenarios', () => {
    it('should work together for a complete workload calculation', () => {
      const teachingHours = 20
      const adminHours = 10
      const totalContract = 40
      const maxTeachingHours = 25
      const maxAdminHours = 15

      const totalAlloc = totalAllocated(teachingHours, adminHours)
      const remainingCapacity = capacity(totalContract, totalAlloc)
      const teachingAvail = teachingAvailability(maxTeachingHours, teachingHours)
      const adminAvail = adminAvailability(maxAdminHours, adminHours)

      expect(totalAlloc).toBe(30)
      expect(remainingCapacity).toBe(10)
      expect(teachingAvail).toBe(5)
      expect(adminAvail).toBe(5)
    })

    it('should handle edge case of full allocation', () => {
      const teachingHours = 25
      const adminHours = 15
      const totalContract = 40
      const maxTeachingHours = 25
      const maxAdminHours = 15

      const totalAlloc = totalAllocated(teachingHours, adminHours)
      const remainingCapacity = capacity(totalContract, totalAlloc)
      const teachingAvail = teachingAvailability(maxTeachingHours, teachingHours)
      const adminAvail = adminAvailability(maxAdminHours, adminHours)

      expect(totalAlloc).toBe(40)
      expect(remainingCapacity).toBe(0)
      expect(teachingAvail).toBe(0)
      expect(adminAvail).toBe(0)
    })

    it('should handle over-allocation scenario', () => {
      const teachingHours = 30
      const adminHours = 20
      const totalContract = 40
      const maxTeachingHours = 25
      const maxAdminHours = 15

      const totalAlloc = totalAllocated(teachingHours, adminHours)
      const remainingCapacity = capacity(totalContract, totalAlloc)
      const teachingAvail = teachingAvailability(maxTeachingHours, teachingHours)
      const adminAvail = adminAvailability(maxAdminHours, adminHours)

      expect(totalAlloc).toBe(50)
      expect(remainingCapacity).toBe(-10)
      expect(teachingAvail).toBe(-5)
      expect(adminAvail).toBe(-5)
    })
  })
}) 