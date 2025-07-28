import { 
  cn,
  timeAgo 
} from '@/lib/notify';

describe('notify', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-2 py-1', 'bg-red-500', 'text-white');
      expect(result).toBe('px-2 py-1 bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class', 'always-class');
      expect(result).toBe('base-class active-class always-class');
    });

    it('should handle false conditional classes', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class', 'always-class');
      expect(result).toBe('base-class always-class');
    });

    it('should handle empty strings and null values', () => {
      const result = cn('base-class', '', null, undefined, 'valid-class');
      expect(result).toBe('base-class valid-class');
    });

    it('should handle object syntax', () => {
      const result = cn('base-class', { 'conditional-class': true, 'other-class': false });
      expect(result).toBe('base-class conditional-class');
    });
  });

  describe('timeAgo', () => {
    beforeEach(() => {
      // Mock Date.now to return a fixed timestamp
      jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00 UTC
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return "just now" for very recent times', () => {
      const recentTime = 1640995199999; // Less than 1 second ago
      expect(timeAgo(recentTime)).toBe('just now');
    });

    it('should format seconds correctly', () => {
      const thirtySecondsAgo = 1640995170000; // 30 seconds ago
      expect(timeAgo(thirtySecondsAgo)).toBe('30 seconds ago');
    });

    it('should format minutes correctly', () => {
      const fiveMinutesAgo = 1640994900000; // 5 minutes ago
      expect(timeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = 1640988000000; // 2 hours ago
      expect(timeAgo(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = 1640736000000; // 3 days ago
      expect(timeAgo(threeDaysAgo)).toBe('3 days ago');
    });

    it('should format months correctly', () => {
      const twoMonthsAgo = 1635724800000; // 2 months ago
      expect(timeAgo(twoMonthsAgo)).toBe('2 months ago');
    });

    it('should format years correctly', () => {
      const oneYearAgo = 1609459200000; // 1 year ago
      expect(timeAgo(oneYearAgo)).toBe('1 year ago');
    });

    it('should handle singular vs plural correctly', () => {
      const oneMinuteAgo = 1640995140000; // 1 minute ago
      const twoMinutesAgo = 1640995080000; // 2 minutes ago
      
      expect(timeAgo(oneMinuteAgo)).toBe('1 minute ago');
      expect(timeAgo(twoMinutesAgo)).toBe('2 minutes ago');
    });

    it('should handle edge case of exactly one unit', () => {
      const oneSecondAgo = 1640995199999; // Less than 1 second ago
      expect(timeAgo(oneSecondAgo)).toBe('just now');
    });
  });
}); 