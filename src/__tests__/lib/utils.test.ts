import { cn, formatDuration, formatPercentage, formatDate, debounce, throttle } from '@/lib/utils'

describe('Utils Module - Critical Business Logic', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      // Arrange
      const classes = ['class1', 'class2', 'class3']
      
      // Act
      const result = cn(...classes)
      
      // Assert
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle conditional classes', () => {
      // Arrange
      const baseClass = 'base'
      const conditionalClass = 'conditional'
      const isActive = true
      
      // Act
      const result = cn(baseClass, isActive && conditionalClass)
      
      // Assert
      expect(result).toBe('base conditional')
    })

    it('should filter out falsy values', () => {
      // Arrange
      const baseClass = 'base'
      const falsyClass = false
      const nullClass = null
      const undefinedClass = undefined
      
      // Act
      const result = cn(baseClass, falsyClass, nullClass, undefinedClass)
      
      // Assert
      expect(result).toBe('base')
    })

    it('should handle empty input', () => {
      // Arrange & Act
      const result = cn()
      
      // Assert
      expect(result).toBe('')
    })

    it('should handle single class', () => {
      // Arrange
      const singleClass = 'single'
      
      // Act
      const result = cn(singleClass)
      
      // Assert
      expect(result).toBe('single')
    })
  })

  describe('formatDuration function', () => {
    test.each([
      [0, '0ms'],
      [100, '100ms'],
      [1000, '1.0s'],
      [1500, '1.5s'],
      [60000, '1.0m'],
      [90000, '1.5m'],
      [3600000, '1.0h'],
      [5400000, '1.5h'],
      [86400000, '1.0d'],
      [129600000, '1.5d']
    ])('should format duration %i ms as %s', (duration, expected) => {
      // Arrange & Act
      const result = formatDuration(duration)
      
      // Assert
      expect(result).toBe(expected)
    })

    it('should handle negative durations', () => {
      // Arrange
      const negativeDuration = -1000
      
      // Act
      const result = formatDuration(negativeDuration)
      
      // Assert
      expect(result).toBe('-1.0s')
    })

    it('should handle very large durations', () => {
      // Arrange
      const largeDuration = 31536000000 // 1 year in ms
      
      // Act
      const result = formatDuration(largeDuration)
      
      // Assert
      expect(result).toBe('365.0d')
    })

    it('should handle decimal precision correctly', () => {
      // Arrange
      const duration = 1234
      
      // Act
      const result = formatDuration(duration)
      
      // Assert
      expect(result).toBe('1.2s')
    })
  })

  describe('formatPercentage function', () => {
    test.each([
      [0, '0%'],
      [0.5, '50%'],
      [1, '100%'],
      [0.123, '12.3%'],
      [0.999, '99.9%'],
      [1.5, '150%']
    ])('should format percentage %f as %s', (value, expected) => {
      // Arrange & Act
      const result = formatPercentage(value)
      
      // Assert
      expect(result).toBe(expected)
    })

    it('should handle negative percentages', () => {
      // Arrange
      const negativeValue = -0.25
      
      // Act
      const result = formatPercentage(negativeValue)
      
      // Assert
      expect(result).toBe('-25%')
    })

    it('should handle very small percentages', () => {
      // Arrange
      const smallValue = 0.001
      
      // Act
      const result = formatPercentage(smallValue)
      
      // Assert
      expect(result).toBe('0.1%')
    })

    it('should handle very large percentages', () => {
      // Arrange
      const largeValue = 2.5
      
      // Act
      const result = formatPercentage(largeValue)
      
      // Assert
      expect(result).toBe('250%')
    })
  })

  describe('formatDate function', () => {
    it('should format current date correctly', () => {
      // Arrange
      const now = new Date('2024-01-15T10:30:00Z')
      
      // Act
      const result = formatDate(now)
      
      // Assert
      expect(result).toMatch(/Jan 15, 2024/)
    })

    it('should handle different date formats', () => {
      // Arrange
      const dates = [
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-12-31T23:59:59Z'),
        new Date('2023-06-15T12:30:45Z')
      ]
      
      // Act & Assert
      dates.forEach(date => {
        const result = formatDate(date)
        expect(result).toMatch(/[A-Za-z]{3} \d{1,2}, \d{4}/)
      })
    })

    it('should handle invalid dates gracefully', () => {
      // Arrange
      const invalidDate = new Date('invalid')
      
      // Act
      const result = formatDate(invalidDate)
      
      // Assert
      expect(result).toBe('Invalid Date')
    })

    it('should handle null and undefined', () => {
      // Arrange & Act & Assert
      expect(formatDate(null as any)).toBe('Invalid Date')
      expect(formatDate(undefined as any)).toBe('Invalid Date')
    })
  })

  describe('debounce function', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce function calls', () => {
      // Arrange
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Act
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      // Assert - Function should not be called immediately
      expect(mockFn).not.toHaveBeenCalled()
      
      // Fast-forward time
      jest.advanceTimersByTime(100)
      
      // Assert - Function should be called once after delay
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle different delay times', () => {
      // Arrange
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 500)
      
      // Act
      debouncedFn()
      
      // Assert - Not called before delay
      jest.advanceTimersByTime(250)
      expect(mockFn).not.toHaveBeenCalled()
      
      // Assert - Called after delay
      jest.advanceTimersByTime(250)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments correctly', () => {
      // Arrange
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Act
      debouncedFn('arg1', 'arg2')
      jest.advanceTimersByTime(100)
      
      // Assert
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should handle multiple rapid calls', () => {
      // Arrange
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Act
      for (let i = 0; i < 10; i++) {
        debouncedFn(i)
      }
      
      // Assert - Should not be called during rapid calls
      expect(mockFn).not.toHaveBeenCalled()
      
      // Fast-forward and assert final call
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith(9) // Last argument
    })
  })

  describe('throttle function', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should throttle function calls', () => {
      // Arrange
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      // Act
      throttledFn()
      throttledFn()
      throttledFn()
      
      // Assert - Should be called immediately on first call
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Fast-forward time
      jest.advanceTimersByTime(100)
      
      // Act - Call again after delay
      throttledFn()
      
      // Assert - Should be called again
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle different throttle intervals', () => {
      // Arrange
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 200)
      
      // Act
      throttledFn()
      
      // Assert - Called immediately
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Act - Call before throttle period ends
      throttledFn()
      
      // Assert - Should not be called again
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Act - Call after throttle period
      jest.advanceTimersByTime(200)
      throttledFn()
      
      // Assert - Should be called again
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments correctly', () => {
      // Arrange
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      // Act
      throttledFn('arg1', 'arg2')
      
      // Assert
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should handle rapid calls within throttle period', () => {
      // Arrange
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      // Act
      for (let i = 0; i < 5; i++) {
        throttledFn(i)
      }
      
      // Assert - Should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith(0) // First argument
    })
  })

  describe('Integration Scenarios', () => {
    it('should work together for complex formatting', () => {
      // Arrange
      const duration = 1500
      const percentage = 0.85
      const date = new Date('2024-01-15T10:30:00Z')
      
      // Act
      const durationStr = formatDuration(duration)
      const percentageStr = formatPercentage(percentage)
      const dateStr = formatDate(date)
      const combinedClasses = cn('base', true && 'active', false && 'hidden')
      
      // Assert
      expect(durationStr).toBe('1.5s')
      expect(percentageStr).toBe('85%')
      expect(dateStr).toMatch(/Jan 15, 2024/)
      expect(combinedClasses).toBe('base active')
    })

    it('should handle edge cases gracefully', () => {
      // Arrange
      const edgeCases = {
        duration: 0,
        percentage: 0,
        date: new Date('invalid'),
        classes: [null, undefined, false, '', 'valid']
      }
      
      // Act
      const results = {
        duration: formatDuration(edgeCases.duration),
        percentage: formatPercentage(edgeCases.percentage),
        date: formatDate(edgeCases.date),
        classes: cn(...edgeCases.classes)
      }
      
      // Assert
      expect(results.duration).toBe('0ms')
      expect(results.percentage).toBe('0%')
      expect(results.date).toBe('Invalid Date')
      expect(results.classes).toBe('valid')
    })
  })

  describe('Performance and Stress Testing', () => {
    it('should handle large numbers of class combinations efficiently', () => {
      // Arrange
      const startTime = performance.now()
      const iterations = 10000
      
      // Act
      for (let i = 0; i < iterations; i++) {
        cn(`class-${i}`, i % 2 === 0 && 'even', i % 3 === 0 && 'divisible-by-3')
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Assert
      expect(duration).toBeLessThan(100) // Should complete within 100ms
    })

    it('should handle rapid debounced calls efficiently', () => {
      // Arrange
      jest.useFakeTimers()
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 50)
      
      // Act
      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        debouncedFn(i)
      }
      const endTime = performance.now()
      
      // Assert
      expect(endTime - startTime).toBeLessThan(10) // Should be very fast
      expect(mockFn).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      jest.useRealTimers()
    })

    it('should handle rapid throttled calls efficiently', () => {
      // Arrange
      jest.useFakeTimers()
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 50)
      
      // Act
      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        throttledFn(i)
      }
      const endTime = performance.now()
      
      // Assert
      expect(endTime - startTime).toBeLessThan(10) // Should be very fast
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      jest.useRealTimers()
    })
  })
}) 