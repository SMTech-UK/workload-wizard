import { 
  cn, 
  updateSettings, 
  generateContractAndHours, 
  calculateTeachingHours, 
  deepEqual 
} from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
      expect(cn('bg-red-500', 'hover:bg-red-600')).toBe('bg-red-500 hover:bg-red-600')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false
      
      expect(cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      )).toBe('base-class active-class')
    })

    it('should handle arrays and objects', () => {
      expect(cn(['px-2', 'py-1'], { 'text-red-500': true, 'text-blue-500': false }))
        .toBe('px-2 py-1 text-red-500')
    })
  })

  describe('updateSettings', () => {
    it('should update nested settings correctly', () => {
      const initialSettings = {
        notifications: { email: true, push: false },
        theme: { mode: 'light', color: 'blue' }
      }

      const updated = updateSettings(
        initialSettings,
        'notifications',
        'email',
        false
      )

      expect(updated).toEqual({
        notifications: { email: false, push: false },
        theme: { mode: 'light', color: 'blue' }
      })
    })

    it('should preserve other categories when updating one', () => {
      const initialSettings = {
        notifications: { email: true },
        theme: { mode: 'dark' }
      }

      const updated = updateSettings(
        initialSettings,
        'theme',
        'mode',
        'light'
      )

      expect(updated.notifications).toEqual({ email: true })
      expect(updated.theme.mode).toBe('light')
    })
  })

  describe('generateContractAndHours', () => {
    it('should generate correct contract string for Academic Practitioner', () => {
      const result = generateContractAndHours({
        fte: 1.0,
        family: 'Academic Practitioner',
        standardContractHours: 1600
      })

      expect(result.contract).toBe('1AP')
      expect(result.totalContract).toBe(1600)
    })

    it('should generate correct contract string for Teaching Academic', () => {
      const result = generateContractAndHours({
        fte: 0.6,
        family: 'Teaching Academic',
        standardContractHours: 1600
      })

      expect(result.contract).toBe('0.6TA')
      expect(result.totalContract).toBe(960)
    })

    it('should generate correct contract string for Research Academic', () => {
      const result = generateContractAndHours({
        fte: 0.8,
        family: 'Research Academic',
        standardContractHours: 1600
      })

      expect(result.contract).toBe('0.8RA')
      expect(result.totalContract).toBe(1280)
    })

    it('should handle decimal FTE values correctly', () => {
      const result = generateContractAndHours({
        fte: 0.75,
        family: 'Teaching Academic',
        standardContractHours: 1600
      })

      expect(result.contract).toBe('0.75TA')
      expect(result.totalContract).toBe(1200)
    })

    it('should handle unknown family gracefully', () => {
      const result = generateContractAndHours({
        fte: 1.0,
        family: 'Unknown Family',
        standardContractHours: 1600
      })

      expect(result.contract).toBe('1Unknown Family')
      expect(result.totalContract).toBe(1600)
    })
  })

  describe('calculateTeachingHours', () => {
    it('should calculate teaching hours for Academic Practitioner', () => {
      const result = calculateTeachingHours({
        totalContract: 1600,
        family: 'Academic Practitioner',
        allocatedTeachingHours: 800
      })

      expect(result.maxTeachingHours).toBe(1280) // 80% of 1600
      expect(result.teachingAvailability).toBe(480) // 1280 - 800
    })

    it('should calculate teaching hours for Teaching Academic', () => {
      const result = calculateTeachingHours({
        totalContract: 1600,
        family: 'Teaching Academic',
        allocatedTeachingHours: 600
      })

      expect(result.maxTeachingHours).toBe(960) // 60% of 1600
      expect(result.teachingAvailability).toBe(360) // 960 - 600
    })

    it('should calculate teaching hours for Research Academic', () => {
      const result = calculateTeachingHours({
        totalContract: 1600,
        family: 'Research Academic',
        allocatedTeachingHours: 200
      })

      expect(result.maxTeachingHours).toBe(480) // 30% of 1600
      expect(result.teachingAvailability).toBe(280) // 480 - 200
    })

    it('should handle zero allocated hours', () => {
      const result = calculateTeachingHours({
        totalContract: 1600,
        family: 'Teaching Academic'
      })

      expect(result.maxTeachingHours).toBe(960)
      expect(result.teachingAvailability).toBe(960)
    })

    it('should handle unknown family with fallback', () => {
      const result = calculateTeachingHours({
        totalContract: 1600,
        family: 'Unknown Family',
        allocatedTeachingHours: 400
      })

      expect(result.maxTeachingHours).toBe(960) // 60% fallback
      expect(result.teachingAvailability).toBe(560)
    })
  })

  describe('deepEqual', () => {
    it('should return true for identical objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: 3 } }
      const obj2 = { a: 1, b: { c: 2, d: 3 } }

      expect(deepEqual(obj1, obj2)).toBe(true)
    })

    it('should return false for different objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: 3 } }
      const obj2 = { a: 1, b: { c: 2, d: 4 } }

      expect(deepEqual(obj1, obj2)).toBe(false)
    })

    it('should handle arrays', () => {
      const arr1 = [1, 2, { a: 3 }]
      const arr2 = [1, 2, { a: 3 }]

      expect(deepEqual(arr1, arr2)).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(deepEqual(null, null)).toBe(true)
      expect(deepEqual(undefined, undefined)).toBe(true)
      expect(deepEqual(null, undefined)).toBe(false)
    })

    it('should handle primitive values', () => {
      expect(deepEqual(1, 1)).toBe(true)
      expect(deepEqual('test', 'test')).toBe(true)
      expect(deepEqual(true, true)).toBe(true)
      expect(deepEqual(1, 2)).toBe(false)
    })
  })
}) 