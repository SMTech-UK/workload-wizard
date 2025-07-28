import { timeAgo } from '@/lib/notify';

describe('Notification Utilities - Critical Business Logic', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('timeAgo Function', () => {
    it('should return "just now" for very recent timestamps', () => {
      // Arrange
      const recentTime = Date.now() - 500; // 0.5 seconds ago
      
      // Act
      const result = timeAgo(recentTime);
      
      // Assert
      expect(result).toBe('just now');
    });

    it('should format seconds correctly', () => {
      // Arrange
      const thirtySecondsAgo = Date.now() - (30 * 1000);
      
      // Act
      const result = timeAgo(thirtySecondsAgo);
      
      // Assert
      expect(result).toBe('30 seconds ago');
    });

    it('should format single second correctly', () => {
      // Arrange
      const oneSecondAgo = Date.now() - (1 * 1000);
      
      // Act
      const result = timeAgo(oneSecondAgo);
      
      // Assert
      expect(result).toBe('1 second ago');
    });

    it('should format minutes correctly', () => {
      // Arrange
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      // Act
      const result = timeAgo(fiveMinutesAgo);
      
      // Assert
      expect(result).toBe('5 minutes ago');
    });

    it('should format single minute correctly', () => {
      // Arrange
      const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
      
      // Act
      const result = timeAgo(oneMinuteAgo);
      
      // Assert
      expect(result).toBe('1 minute ago');
    });

    it('should format hours correctly', () => {
      // Arrange
      const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(threeHoursAgo);
      
      // Assert
      expect(result).toBe('3 hours ago');
    });

    it('should format single hour correctly', () => {
      // Arrange
      const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(oneHourAgo);
      
      // Assert
      expect(result).toBe('1 hour ago');
    });

    it('should format days correctly', () => {
      // Arrange
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(twoDaysAgo);
      
      // Assert
      expect(result).toBe('2 days ago');
    });

    it('should format single day correctly', () => {
      // Arrange
      const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(oneDayAgo);
      
      // Assert
      expect(result).toBe('1 day ago');
    });

    it('should format months correctly', () => {
      // Arrange
      const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(sixMonthsAgo);
      
      // Assert
      expect(result).toBe('6 months ago');
    });

    it('should format single month correctly', () => {
      // Arrange
      const oneMonthAgo = Date.now() - (1 * 30 * 24 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(oneMonthAgo);
      
      // Assert
      expect(result).toBe('1 month ago');
    });

    it('should format years correctly', () => {
      // Arrange
      const twoYearsAgo = Date.now() - (2 * 365 * 24 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(twoYearsAgo);
      
      // Assert
      expect(result).toBe('2 years ago');
    });

    it('should format single year correctly', () => {
      // Arrange
      const oneYearAgo = Date.now() - (1 * 365 * 24 * 60 * 60 * 1000);
      
      // Act
      const result = timeAgo(oneYearAgo);
      
      // Assert
      expect(result).toBe('1 year ago');
    });

    it('should handle future timestamps', () => {
      // Arrange
      const futureTime = Date.now() + (5 * 60 * 1000); // 5 minutes in the future
      
      // Act
      const result = timeAgo(futureTime);
      
      // Assert
      expect(result).toBe('just now');
    });

    it('should handle zero timestamp', () => {
      // Arrange
      const zeroTime = 0;
      
      // Act
      const result = timeAgo(zeroTime);
      
      // Assert
      expect(result).toBe('54 years ago'); // Zero timestamp is in the past
    });

    it('should handle negative timestamps', () => {
      // Arrange
      const negativeTime = -1000;
      
      // Act
      const result = timeAgo(negativeTime);
      
      // Assert
      expect(result).toBe('54 years ago'); // Negative timestamp is in the past
    });

    it('should handle very large timestamps', () => {
      // Arrange
      const largeTime = Date.now() - (100 * 365 * 24 * 60 * 60 * 1000); // 100 years ago
      
      // Act
      const result = timeAgo(largeTime);
      
      // Assert
      expect(result).toBe('100 years ago');
    });

    it('should handle decimal seconds correctly', () => {
      // Arrange
      const decimalSecondsAgo = Date.now() - (30.7 * 1000); // 30.7 seconds ago
      
      // Act
      const result = timeAgo(decimalSecondsAgo);
      
      // Assert
      expect(result).toBe('30 seconds ago'); // Should floor to 30
    });

    it('should handle edge case between units', () => {
      // Arrange
      const exactlyOneMinuteAgo = Date.now() - (60 * 1000); // Exactly 60 seconds ago
      
      // Act
      const result = timeAgo(exactlyOneMinuteAgo);
      
      // Assert
      expect(result).toBe('1 minute ago');
    });

    it('should handle edge case between hours and days', () => {
      // Arrange
      const exactlyOneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // Exactly 24 hours ago
      
      // Act
      const result = timeAgo(exactlyOneDayAgo);
      
      // Assert
      expect(result).toBe('1 day ago');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very small time differences', () => {
      // Arrange
      const tinyDiff = Date.now() - 100; // 0.1 seconds ago
      
      // Act
      const result = timeAgo(tinyDiff);
      
      // Assert
      expect(result).toBe('just now');
    });

    it('should handle maximum safe integer', () => {
      // Arrange
      const maxSafeTime = Number.MAX_SAFE_INTEGER;
      
      // Act
      const result = timeAgo(maxSafeTime);
      
      // Assert
      expect(result).toBe('just now');
    });

    it('should handle minimum safe integer', () => {
      // Arrange
      const minSafeTime = Number.MIN_SAFE_INTEGER;
      
      // Act
      const result = timeAgo(minSafeTime);
      
      // Assert
      expect(result).toBe('285670 years ago'); // Very old timestamp
    });

    it('should handle NaN input', () => {
      // Arrange
      const nanTime = NaN;
      
      // Act
      const result = timeAgo(nanTime);
      
      // Assert
      expect(result).toBe('just now');
    });

    it('should handle Infinity input', () => {
      // Arrange
      const infinityTime = Infinity;
      
      // Act
      const result = timeAgo(infinityTime);
      
      // Assert
      expect(result).toBe('just now');
    });

    it('should handle -Infinity input', () => {
      // Arrange
      const negativeInfinityTime = -Infinity;
      
      // Act
      const result = timeAgo(negativeInfinityTime);
      
      // Assert
      expect(result).toBe('Infinity years ago'); // -Infinity results in Infinity years ago
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle realistic academic notification scenarios', () => {
      // Arrange
      const scenarios = [
        { time: Date.now() - (5 * 60 * 1000), expected: '5 minutes ago' }, // Recent notification
        { time: Date.now() - (2 * 60 * 60 * 1000), expected: '2 hours ago' }, // Today's notification
        { time: Date.now() - (3 * 24 * 60 * 60 * 1000), expected: '3 days ago' }, // This week's notification
        { time: Date.now() - (2 * 30 * 24 * 60 * 60 * 1000), expected: '2 months ago' }, // Recent semester
        { time: Date.now() - (1 * 365 * 24 * 60 * 60 * 1000), expected: '1 year ago' }, // Last academic year
      ];

      // Act & Assert
      scenarios.forEach(({ time, expected }) => {
        const result = timeAgo(time);
        expect(result).toBe(expected);
      });
    });

    it('should handle workload allocation notification timing', () => {
      // Arrange
      const allocationScenarios = [
        { time: Date.now() - (30 * 1000), expected: '30 seconds ago' }, // Just allocated
        { time: Date.now() - (15 * 60 * 1000), expected: '15 minutes ago' }, // Recently allocated
        { time: Date.now() - (2 * 60 * 60 * 1000), expected: '2 hours ago' }, // Today's allocation
        { time: Date.now() - (1 * 24 * 60 * 60 * 1000), expected: '1 day ago' }, // Yesterday's allocation
      ];

      // Act & Assert
      allocationScenarios.forEach(({ time, expected }) => {
        const result = timeAgo(time);
        expect(result).toBe(expected);
      });
    });

    it('should handle module iteration notification timing', () => {
      // Arrange
      const moduleScenarios = [
        { time: Date.now() - (5 * 60 * 1000), expected: '5 minutes ago' }, // Just created
        { time: Date.now() - (1 * 60 * 60 * 1000), expected: '1 hour ago' }, // Recently created
        { time: Date.now() - (7 * 24 * 60 * 60 * 1000), expected: '7 days ago' }, // Last week
        { time: Date.now() - (1 * 30 * 24 * 60 * 60 * 1000), expected: '1 month ago' }, // Last month
      ];

      // Act & Assert
      moduleScenarios.forEach(({ time, expected }) => {
        const result = timeAgo(time);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid successive calls', () => {
      // Arrange
      const baseTime = Date.now() - (5 * 60 * 1000);
      
      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const result = timeAgo(baseTime);
        expect(result).toBe('5 minutes ago');
      }
    });

    it('should maintain consistency across different time zones', () => {
      // Arrange
      const originalTimezone = process.env.TZ;
      const testTime = Date.now() - (1 * 60 * 60 * 1000);
      
      // Act & Assert
      const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
      
      timezones.forEach(tz => {
        process.env.TZ = tz;
        const result = timeAgo(testTime);
        expect(result).toBe('1 hour ago');
      });
      
      // Cleanup
      if (originalTimezone) {
        process.env.TZ = originalTimezone;
      } else {
        delete process.env.TZ;
      }
    });

    it('should handle leap year calculations correctly', () => {
      // Arrange
      // Mock to a leap year date
      jest.setSystemTime(new Date('2024-02-29T12:00:00Z'));
      const oneYearAgo = Date.now() - (366 * 24 * 60 * 60 * 1000); // 366 days ago (leap year)
      
      // Act
      const result = timeAgo(oneYearAgo);
      
      // Assert
      expect(result).toBe('1 year ago');
    });
  });
}); 