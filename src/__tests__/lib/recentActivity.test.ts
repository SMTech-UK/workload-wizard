import { 
  formatRecentActivity,
  type RecentActivityArgs
} from '@/lib/recentActivity';

describe('recentActivity', () => {
  describe('formatRecentActivity', () => {
    it('should format lecturer created activity', () => {
      const args: RecentActivityArgs = {
        action: 'create',
        changeType: 'create',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_created',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer Dr. John Smith created by Admin User');
    });

    it('should format lecturer created activity without modifiedBy', () => {
      const args: RecentActivityArgs = {
        action: 'create',
        changeType: 'create',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_created',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer Dr. John Smith created');
    });

    it('should format lecturer deleted activity', () => {
      const args: RecentActivityArgs = {
        action: 'delete',
        changeType: 'delete',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_deleted',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer Dr. John Smith deleted by Admin User');
    });

    it('should format lecturer edited activity with section', () => {
      const args: RecentActivityArgs = {
        action: 'edit',
        changeType: 'edit',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_edited',
        details: {
          lecturerId: 'lecturer-123',
          section: 'contact',
        },
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer Dr. John Smith edited (contact) by Admin User');
    });

    it('should format lecturer edited activity without section', () => {
      const args: RecentActivityArgs = {
        action: 'edit',
        changeType: 'edit',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_edited',
        details: {
          lecturerId: 'lecturer-123',
        },
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer Dr. John Smith edited by Admin User');
    });

    it('should format generic activity for unknown types', () => {
      const args: RecentActivityArgs = {
        action: 'update',
        changeType: 'modified',
        entity: 'module',
        entityId: 'CS101',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Module CS101 modified (update)');
    });

    it('should format generic activity without action', () => {
      const args: RecentActivityArgs = {
        action: '',
        changeType: 'created',
        entity: 'module',
        entityId: 'CS101',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Module CS101 created');
    });

    it('should handle empty modifiedBy array', () => {
      const args: RecentActivityArgs = {
        action: 'create',
        changeType: 'create',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_created',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer Dr. John Smith created');
    });

    it('should handle missing fullName for lecturer types', () => {
      const args: RecentActivityArgs = {
        action: 'create',
        changeType: 'create',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        type: 'lecturer_created',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer lecturer-123 create (create)');
    });

    it('should handle missing details for lecturer_edited', () => {
      const args: RecentActivityArgs = {
        action: 'edit',
        changeType: 'edit',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_edited',
      };

      const result = formatRecentActivity(args);
      expect(result).toBe('Lecturer lecturer-123 edit (edit)');
    });
  });

  describe('RecentActivityArgs type', () => {
    it('should accept valid activity arguments', () => {
      const validArgs: RecentActivityArgs = {
        action: 'create',
        changeType: 'create',
        entity: 'lecturer',
        entityId: 'lecturer-123',
        modifiedBy: [{ name: 'Admin User', email: 'admin@example.com' }],
        permission: 'admin',
        fullName: 'Dr. John Smith',
        type: 'lecturer_created',
        details: { lecturerId: 'lecturer-123' },
        timestamp: '2023-01-01T00:00:00Z',
      };

      expect(validArgs).toBeDefined();
      expect(validArgs.entity).toBe('lecturer');
      expect(validArgs.modifiedBy).toHaveLength(1);
    });
  });
}); 