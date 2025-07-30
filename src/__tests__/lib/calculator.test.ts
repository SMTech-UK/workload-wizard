import { totalAllocated, capacity, teachingAvailability, adminAvailability } from '@/lib/calculator';

describe('Academic Workload Calculator - Critical Business Logic', () => {
  describe('totalAllocated Function', () => {
    it('should calculate total allocated hours when both teaching and admin hours are provided', () => {
      // Arrange
      const teachingHours = 20;
      const adminHours = 10;

      // Act
      const result = totalAllocated(teachingHours, adminHours);

      // Assert
      expect(result).toBe(30);
    });

    it('should return zero when both teaching and admin hours are zero', () => {
      // Arrange
      const teachingHours = 0;
      const adminHours = 0;

      // Act
      const result = totalAllocated(teachingHours, adminHours);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle negative teaching hours correctly', () => {
      // Arrange
      const teachingHours = -5;
      const adminHours = 10;

      // Act
      const result = totalAllocated(teachingHours, adminHours);

      // Assert
      expect(result).toBe(5);
    });

    it('should handle decimal values with proper precision', () => {
      // Arrange
      const teachingHours = 20.5;
      const adminHours = 10.5;

      // Act
      const result = totalAllocated(teachingHours, adminHours);

      // Assert
      expect(result).toBe(31);
    });

    it('should handle very large numbers without overflow', () => {
      // Arrange
      const teachingHours = 1000;
      const adminHours = 500;

      // Act
      const result = totalAllocated(teachingHours, adminHours);

      // Assert
      expect(result).toBe(1500);
    });
  });

  describe('capacity Function', () => {
    it('should calculate remaining capacity when lecturer has available hours', () => {
      // Arrange
      const totalContract = 40;
      const totalAllocated = 30;

      // Act
      const result = capacity(totalContract, totalAllocated);

      // Assert
      expect(result).toBe(10);
    });

    it('should return zero capacity when lecturer is fully allocated', () => {
      // Arrange
      const totalContract = 40;
      const totalAllocated = 40;

      // Act
      const result = capacity(totalContract, totalAllocated);

      // Assert
      expect(result).toBe(0);
    });

    it('should return negative capacity when lecturer is over-allocated', () => {
      // Arrange
      const totalContract = 40;
      const totalAllocated = 50;

      // Act
      const result = capacity(totalContract, totalAllocated);

      // Assert
      expect(result).toBe(-10);
    });

    it('should handle decimal values with proper precision', () => {
      // Arrange
      const totalContract = 40.5;
      const totalAllocated = 30.2;

      // Act
      const result = capacity(totalContract, totalAllocated);

      // Assert
      expect(result).toBeCloseTo(10.3, 10);
    });
  });

  describe('teachingAvailability Function', () => {
    it('should calculate teaching availability when lecturer has remaining teaching capacity', () => {
      // Arrange
      const maxTeachingHours = 25;
      const teachingHours = 20;

      // Act
      const result = teachingAvailability(maxTeachingHours, teachingHours);

      // Assert
      expect(result).toBe(5);
    });

    it('should return zero when lecturer has reached maximum teaching hours', () => {
      // Arrange
      const maxTeachingHours = 25;
      const teachingHours = 25;

      // Act
      const result = teachingAvailability(maxTeachingHours, teachingHours);

      // Assert
      expect(result).toBe(0);
    });

    it('should return negative availability when lecturer exceeds maximum teaching hours', () => {
      // Arrange
      const maxTeachingHours = 25;
      const teachingHours = 30;

      // Act
      const result = teachingAvailability(maxTeachingHours, teachingHours);

      // Assert
      expect(result).toBe(-5);
    });

    it('should handle decimal values with proper precision', () => {
      // Arrange
      const maxTeachingHours = 25.5;
      const teachingHours = 20.2;

      // Act
      const result = teachingAvailability(maxTeachingHours, teachingHours);

      // Assert
      expect(result).toBeCloseTo(5.3, 10);
    });
  });

  describe('adminAvailability Function', () => {
    it('should calculate admin availability when lecturer has remaining admin capacity', () => {
      // Arrange
      const maxAdminHours = 15;
      const adminHours = 10;

      // Act
      const result = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(result).toBe(5);
    });

    it('should return zero when lecturer has reached maximum admin hours', () => {
      // Arrange
      const maxAdminHours = 15;
      const adminHours = 15;

      // Act
      const result = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(result).toBe(0);
    });

    it('should return negative availability when lecturer exceeds maximum admin hours', () => {
      // Arrange
      const maxAdminHours = 15;
      const adminHours = 20;

      // Act
      const result = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(result).toBe(-5);
    });

    it('should handle decimal values with proper precision', () => {
      // Arrange
      const maxAdminHours = 15.5;
      const adminHours = 10.2;

      // Act
      const result = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(result).toBeCloseTo(5.3, 10);
    });
  });

  describe('Integration Scenarios - Complete Workload Calculations', () => {
    it('should calculate complete workload for a typical lecturer scenario', () => {
      // Arrange
      const teachingHours = 20;
      const adminHours = 10;
      const totalContract = 40;
      const maxTeachingHours = 25;
      const maxAdminHours = 15;

      // Act
      const totalAlloc = totalAllocated(teachingHours, adminHours);
      const remainingCapacity = capacity(totalContract, totalAlloc);
      const teachingAvail = teachingAvailability(maxTeachingHours, teachingHours);
      const adminAvail = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(totalAlloc).toBe(30);
      expect(remainingCapacity).toBe(10);
      expect(teachingAvail).toBe(5);
      expect(adminAvail).toBe(5);
    });

    it('should handle full allocation scenario where lecturer has no remaining capacity', () => {
      // Arrange
      const teachingHours = 25;
      const adminHours = 15;
      const totalContract = 40;
      const maxTeachingHours = 25;
      const maxAdminHours = 15;

      // Act
      const totalAlloc = totalAllocated(teachingHours, adminHours);
      const remainingCapacity = capacity(totalContract, totalAlloc);
      const teachingAvail = teachingAvailability(maxTeachingHours, teachingHours);
      const adminAvail = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(totalAlloc).toBe(40);
      expect(remainingCapacity).toBe(0);
      expect(teachingAvail).toBe(0);
      expect(adminAvail).toBe(0);
    });

    it('should handle over-allocation scenario where lecturer exceeds capacity', () => {
      // Arrange
      const teachingHours = 30;
      const adminHours = 20;
      const totalContract = 40;
      const maxTeachingHours = 25;
      const maxAdminHours = 15;

      // Act
      const totalAlloc = totalAllocated(teachingHours, adminHours);
      const remainingCapacity = capacity(totalContract, totalAlloc);
      const teachingAvail = teachingAvailability(maxTeachingHours, teachingHours);
      const adminAvail = adminAvailability(maxAdminHours, adminHours);

      // Assert
      expect(totalAlloc).toBe(50);
      expect(remainingCapacity).toBe(-10);
      expect(teachingAvail).toBe(-5);
      expect(adminAvail).toBe(-5);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large numbers without overflow or precision loss', () => {
      // Arrange
      const largeNumber = 999999999;

      // Act & Assert
      expect(totalAllocated(largeNumber, largeNumber)).toBe(largeNumber * 2);
      expect(capacity(largeNumber * 2, largeNumber)).toBe(largeNumber);
      expect(teachingAvailability(largeNumber, largeNumber)).toBe(0);
      expect(adminAvailability(largeNumber, largeNumber)).toBe(0);
    });

    it('should handle very small decimal numbers with proper precision', () => {
      // Arrange
      const smallNumber = 0.001;

      // Act & Assert
      expect(totalAllocated(smallNumber, smallNumber)).toBe(0.002);
      expect(capacity(1, smallNumber)).toBeCloseTo(0.999, 10);
      expect(teachingAvailability(1, smallNumber)).toBeCloseTo(0.999, 10);
      expect(adminAvailability(1, smallNumber)).toBeCloseTo(0.999, 10);
    });

    it('should handle mixed positive and negative values correctly', () => {
      // Arrange
      const testCase1 = { teaching: 20, admin: -5, expected: 15 };
      const testCase2 = { contract: 40, allocated: 15, expected: 25 };
      const testCase3 = { max: 25, allocated: -5, expected: 30 };
      const testCase4 = { max: 15, allocated: -3, expected: 18 };

      // Act & Assert
      expect(totalAllocated(testCase1.teaching, testCase1.admin)).toBe(testCase1.expected);
      expect(capacity(testCase2.contract, testCase2.allocated)).toBe(testCase2.expected);
      expect(teachingAvailability(testCase3.max, testCase3.allocated)).toBe(testCase3.expected);
      expect(adminAvailability(testCase4.max, testCase4.allocated)).toBe(testCase4.expected);
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle rapid calculations without performance degradation', () => {
      // Arrange
      const iterations = 10000;
      const startTime = performance.now();

      // Act
      for (let i = 0; i < iterations; i++) {
        totalAllocated(i, i + 1);
        capacity(i * 2, i);
        teachingAvailability(i * 2, i);
        adminAvailability(i * 2, i);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should maintain precision with floating point arithmetic across multiple operations', () => {
      // Arrange
      const precisionTests = [
        { teaching: 0.1, admin: 0.2, expected: 0.3 },
        { teaching: 0.01, admin: 0.02, expected: 0.03 },
        { teaching: 0.001, admin: 0.002, expected: 0.003 }
      ];

      // Act & Assert
      precisionTests.forEach(({ teaching, admin, expected }) => {
        const result = totalAllocated(teaching, admin);
        expect(result).toBeCloseTo(expected, 10);
      });
    });
  });

  // TODO: Add tests for FTE calculations when implemented
  // TODO: Add tests for workload validation rules when implemented
  // TODO: Add tests for academic year calculations when implemented
}); 