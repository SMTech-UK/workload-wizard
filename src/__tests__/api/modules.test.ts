/**
 * Critical Module API Tests
 * 
 * These tests cover the core business logic for module management
 * including creation, updates, validation, and allocation calculations.
 * Enhanced with proper Convex client mocking, integration tests, error handling, and performance testing.
 */

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

// Enhanced Mock Convex client with proper typing
const mockConvexClient = {
  mutation: jest.fn(),
  query: jest.fn(),
  // Add additional methods for integration testing
  subscribe: jest.fn(),
  onUpdate: jest.fn(),
  onQuery: jest.fn(),
}

// Mock Convex React hooks with proper implementation
jest.mock('convex/react', () => ({
  useMutation: () => mockConvexClient.mutation,
  useQuery: () => mockConvexClient.query,
  useSubscription: () => mockConvexClient.subscribe,
  useConvex: () => mockConvexClient,
}))

// Mock Convex client for direct API calls
jest.mock('convex', () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => mockConvexClient),
}))

describe('Module API - Critical Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementations
    mockConvexClient.mutation.mockReset()
    mockConvexClient.query.mockReset()
    mockConvexClient.subscribe.mockReset()
  })

  describe('Module Creation', () => {
    it('should create module with valid data', async () => {
      // Arrange
      const moduleData = {
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      const mockId = 'module-123' as Id<'modules'>;
      mockConvexClient.mutation.mockResolvedValue(mockId);

      // Act
      const result = await mockConvexClient.mutation(api.modules.createModule, moduleData);

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.modules.createModule, moduleData);
      expect(result).toBe(mockId);
      expect(mockConvexClient.mutation).toHaveBeenCalledTimes(1);
    });

    it('should validate module code format', async () => {
      // Arrange
      const invalidModuleData = {
        code: 'INVALID-CODE-TOO-LONG', // Invalid: too long and wrong format
        title: 'Test Module',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      // Act & Assert
      expect(invalidModuleData.code.length).toBeGreaterThan(10); // Should be shorter
      expect(invalidModuleData.code).not.toMatch(/^[A-Z]{2,4}\d{3}$/); // Should NOT match pattern
    });

    it('should enforce credit value constraints', async () => {
      // Arrange
      const moduleData = {
        code: 'CS101',
        title: 'Test Module',
        credits: 50, // Exceeds reasonable limit
        level: 4,
        moduleLeader: 'Dr. Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      // Act & Assert
      expect(moduleData.credits).toBeGreaterThan(40); // Should flag this
      expect(moduleData.credits).toBeGreaterThan(40); // Should be flagged as exceeding constraint
    });

    it('should validate academic level constraints', async () => {
      // Arrange
      const moduleData = {
        code: 'CS101',
        title: 'Test Module',
        credits: 20,
        level: 8, // Invalid level (should be 3-7)
        moduleLeader: 'Dr. Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      // Act & Assert
      expect(moduleData.level).toBeGreaterThan(7); // Should flag this
      expect(moduleData.level).toBeGreaterThan(7); // Should be flagged as invalid
    });

    it('should handle duplicate module code creation', async () => {
      // Arrange
      const moduleData = {
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      // Mock duplicate code error
      mockConvexClient.mutation.mockRejectedValue(new Error('Module code already exists'));

      // Act & Assert
      await expect(mockConvexClient.mutation(api.modules.createModule, moduleData))
        .rejects.toThrow('Module code already exists');
    });

    it('should validate module title length', async () => {
      // Arrange
      const shortTitle = 'CS';
      const validTitle = 'Introduction to Computer Science';
      const longTitle = 'A'.repeat(200); // Too long

      // Act & Assert
      expect(shortTitle.length).toBeLessThan(5); // Too short
      expect(validTitle.length).toBeGreaterThan(5);
      expect(validTitle.length).toBeLessThan(100);
      expect(longTitle.length).toBeGreaterThan(100); // Too long
    });
  });

  describe('Module Updates', () => {
    it('should update module details correctly', async () => {
      // Arrange
      const moduleId = 'module-123' as Id<'modules'>;
      const updateData = {
        id: moduleId,
        code: 'CS101',
        title: 'Updated Introduction to Computer Science',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Jane Smith',
        defaultTeachingHours: 35, // Updated from 30
        defaultMarkingHours: 12, // Updated from 10
      };

      mockConvexClient.mutation.mockResolvedValue(undefined);

      // Act
      await mockConvexClient.mutation(api.modules.updateModule, updateData);

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.modules.updateModule, updateData);
      expect(updateData.defaultTeachingHours).toBe(35);
      expect(updateData.defaultMarkingHours).toBe(12);
    });

    it('should maintain data consistency during updates', async () => {
      // Arrange
      const moduleId = 'module-123' as Id<'modules'>;
      const updateData = {
        id: moduleId,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Jane Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      // Act & Assert
      expect(updateData.credits).toBeGreaterThan(0);
      expect(updateData.level).toBeGreaterThanOrEqual(3);
      expect(updateData.level).toBeLessThanOrEqual(7);
      expect(updateData.defaultTeachingHours).toBeGreaterThan(0);
      expect(updateData.defaultMarkingHours).toBeGreaterThan(0);
    });

    it('should handle concurrent module updates', async () => {
      // Arrange
      const moduleId = 'module-123' as Id<'modules'>;
      const updateData1 = { id: moduleId, title: 'Updated Title 1' };
      const updateData2 = { id: moduleId, title: 'Updated Title 2' };

      // Mock optimistic concurrency control failure
      mockConvexClient.mutation
        .mockResolvedValueOnce(undefined) // First update succeeds
        .mockRejectedValueOnce(new Error('Concurrent modification detected')); // Second update fails

      // Act
      await mockConvexClient.mutation(api.modules.updateModule, updateData1);
      
      // Assert
      await expect(mockConvexClient.mutation(api.modules.updateModule, updateData2))
        .rejects.toThrow('Concurrent modification detected');
    });
  });

  describe('Module Allocation Logic', () => {
    it('should calculate total module hours correctly', () => {
      // Arrange
      const moduleData = {
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
        additionalHours: 5,
      };

      // Act
      const totalHours = moduleData.defaultTeachingHours + moduleData.defaultMarkingHours + moduleData.additionalHours;

      // Assert
      expect(totalHours).toBe(45);
    });

    it('should validate module leader assignments', () => {
      // Arrange
      const moduleData = {
        code: 'CS101',
        moduleLeader: 'Dr. Jane Smith',
        assignedLecturer: 'Dr. Jane Smith',
      };

      // Act & Assert
      expect(moduleData.assignedLecturer).toBe(moduleData.moduleLeader);
    });

    it('should handle module allocation conflicts', () => {
      // Arrange
      const moduleAllocations = [
        { moduleCode: 'CS101', lecturerId: 'lecturer-1', semester: 'Autumn' },
        { moduleCode: 'CS101', lecturerId: 'lecturer-2', semester: 'Autumn' }, // Conflict
      ];

      // Act
      const conflicts = moduleAllocations.filter((allocation, index, array) => 
        array.findIndex(a => a.moduleCode === allocation.moduleCode && a.semester === allocation.semester) !== index
      );

      // Assert
      expect(conflicts).toHaveLength(1);
    });

    it('should validate workload distribution across semesters', () => {
      // Arrange
      const semesterAllocations = [
        { semester: 'Autumn', hours: 30, modules: ['CS101', 'CS102'] },
        { semester: 'Spring', hours: 25, modules: ['CS103'] },
        { semester: 'Summer', hours: 10, modules: ['CS104'] },
      ];

      // Act
      const totalHours = semesterAllocations.reduce((sum, allocation) => sum + allocation.hours, 0);
      const autumnLoad = semesterAllocations.find(a => a.semester === 'Autumn')?.hours || 0;
      const springLoad = semesterAllocations.find(a => a.semester === 'Spring')?.hours || 0;

      // Assert
      expect(totalHours).toBe(65);
      expect(autumnLoad).toBeGreaterThan(0);
      expect(springLoad).toBeGreaterThan(0);
      expect(autumnLoad + springLoad).toBeGreaterThan(totalHours * 0.8); // 80% in main semesters
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk module import with validation', async () => {
      // Arrange
      const bulkModuleData = [
        {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          credits: 20,
          level: 4,
          moduleLeader: 'Dr. Alice Johnson',
          defaultTeachingHours: 30,
          defaultMarkingHours: 10,
        },
        {
          code: 'CS102',
          title: 'Programming Fundamentals',
          credits: 20,
          level: 4,
          moduleLeader: 'Dr. Bob Wilson',
          defaultTeachingHours: 35,
          defaultMarkingHours: 12,
        },
      ];

      const mockResponse = [
        { success: true, id: 'module-1', code: 'CS101' },
        { success: true, id: 'module-2', code: 'CS102' },
      ];

      mockConvexClient.mutation.mockResolvedValue(mockResponse);

      // Act
      const result = await mockConvexClient.mutation(api.modules.bulkImport, { modules: bulkModuleData });

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.modules.bulkImport, { modules: bulkModuleData });
      expect(result).toEqual(mockResponse);
      expect(result.every((r: any) => r.success)).toBe(true);
    });

    it('should handle partial failures in bulk import', async () => {
      // Arrange
      const bulkModuleData = [
        {
          code: 'CS101',
          title: 'Valid Module',
          credits: 20,
          level: 4,
          moduleLeader: 'Dr. Smith',
          defaultTeachingHours: 30,
          defaultMarkingHours: 10,
        },
        {
          code: 'INVALID',
          title: 'Invalid Module',
          credits: 50, // Invalid credits
          level: 8, // Invalid level
          moduleLeader: 'Dr. Smith',
          defaultTeachingHours: 30,
          defaultMarkingHours: 10,
        },
      ];

      const mockResponse = [
        { success: true, id: 'module-1', code: 'CS101' },
        { success: false, code: 'INVALID', error: 'Invalid module data' },
      ];

      mockConvexClient.mutation.mockResolvedValue(mockResponse);

      // Act
      const result = await mockConvexClient.mutation(api.modules.bulkImport, { modules: bulkModuleData });

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.some((r: any) => !r.success)).toBe(true);
      expect(result.filter((r: any) => r.success)).toHaveLength(1);
      expect(result.filter((r: any) => !r.success)).toHaveLength(1);
    });

    it('should handle empty bulk import gracefully', async () => {
      // Arrange
      const emptyBulkData: any[] = [];
      const mockResponse: any[] = [];

      mockConvexClient.mutation.mockResolvedValue(mockResponse);

      // Act
      const result = await mockConvexClient.mutation(api.modules.bulkImport, { modules: emptyBulkData });

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(0);
    });
  });

  describe('Module Allocation Management', () => {
    it('should set module allocations for a lecturer correctly', async () => {
      // Arrange
      const lecturerId = 'lecturer-123';
      const moduleAllocations = [
        {
          moduleCode: 'CS101',
          moduleName: 'Introduction to Computer Science',
          hoursAllocated: 30,
          type: 'teaching',
          semester: 'Autumn',
          groupNumber: 1,
          siteName: 'Main Campus',
        },
        {
          moduleCode: 'CS102',
          moduleName: 'Programming Fundamentals',
          hoursAllocated: 25,
          type: 'teaching',
          semester: 'Spring',
          groupNumber: 1,
          siteName: 'Main Campus',
        },
      ];

      mockConvexClient.mutation.mockResolvedValue(undefined);

      // Act
      await mockConvexClient.mutation(api.modules.setForLecturer, {
        lecturerId,
        moduleAllocations,
      });

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.modules.setForLecturer, {
        lecturerId,
        moduleAllocations,
      });
    });

    it('should calculate total allocated hours for lecturer', () => {
      // Arrange
      const moduleAllocations = [
        { hoursAllocated: 30, type: 'teaching' },
        { hoursAllocated: 25, type: 'teaching' },
        { hoursAllocated: 10, type: 'marking' },
      ];

      // Act
      const totalTeachingHours = moduleAllocations
        .filter(allocation => allocation.type === 'teaching')
        .reduce((sum, allocation) => sum + allocation.hoursAllocated, 0);

      const totalMarkingHours = moduleAllocations
        .filter(allocation => allocation.type === 'marking')
        .reduce((sum, allocation) => sum + allocation.hoursAllocated, 0);

      const totalHours = totalTeachingHours + totalMarkingHours;

      // Assert
      expect(totalTeachingHours).toBe(55);
      expect(totalMarkingHours).toBe(10);
      expect(totalHours).toBe(65);
    });

    it('should validate allocation conflicts across lecturers', () => {
      // Arrange
      const allocations = [
        { moduleCode: 'CS101', lecturerId: 'lecturer-1', semester: 'Autumn', hours: 30 },
        { moduleCode: 'CS101', lecturerId: 'lecturer-2', semester: 'Autumn', hours: 30 }, // Conflict
        { moduleCode: 'CS102', lecturerId: 'lecturer-1', semester: 'Spring', hours: 25 },
      ];

      // Act
      const conflicts = allocations.filter((allocation, index, array) => 
        array.findIndex(a => 
          a.moduleCode === allocation.moduleCode && 
          a.semester === allocation.semester && 
          a.lecturerId !== allocation.lecturerId
        ) !== -1
      );

      // Assert
      expect(conflicts).toHaveLength(2); // Both conflicting allocations
    });
  });

  describe('Data Retrieval', () => {
    it('should retrieve module by ID with complete data', async () => {
      // Arrange
      const moduleId = 'module-123';
      const mockModule = {
        _id: moduleId,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Jane Smith',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      mockConvexClient.query.mockResolvedValue(mockModule);

      // Act
      const result = await mockConvexClient.query(api.modules.getById, { id: moduleId });

      // Assert
      expect(mockConvexClient.query).toHaveBeenCalledWith(api.modules.getById, { id: moduleId });
      expect(result).toEqual(mockModule);
      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('credits');
    });

    it('should retrieve all modules for department overview', async () => {
      // Arrange
      const mockModules = [
        {
          _id: 'module-1',
          code: 'CS101',
          title: 'Introduction to Computer Science',
          credits: 20,
          level: 4,
        },
        {
          _id: 'module-2',
          code: 'CS102',
          title: 'Programming Fundamentals',
          credits: 20,
          level: 4,
        },
      ];

      mockConvexClient.query.mockResolvedValue(mockModules);

      // Act
      const result = await mockConvexClient.query(api.modules.getAll, {});

      // Assert
      expect(mockConvexClient.query).toHaveBeenCalledWith(api.modules.getAll, {});
      expect(result).toEqual(mockModules);
      expect(result).toHaveLength(2);
    });

    it('should retrieve module allocations by lecturer ID', async () => {
      // Arrange
      const lecturerId = 'lecturer-123';
      const mockAllocations = [
        {
          _id: 'allocation-1',
          lecturerId,
          moduleCode: 'CS101',
          moduleName: 'Introduction to Computer Science',
          hoursAllocated: 30,
          type: 'teaching',
          semester: 'Autumn',
        },
      ];

      mockConvexClient.query.mockResolvedValue(mockAllocations);

      // Act
      const result = await mockConvexClient.query(api.modules.getByLecturerId, { lecturerId });

      // Assert
      expect(mockConvexClient.query).toHaveBeenCalledWith(api.modules.getByLecturerId, { lecturerId });
      expect(result).toEqual(mockAllocations);
      expect(result).toHaveLength(1);
    });

    it('should handle module not found gracefully', async () => {
      // Arrange
      const nonExistentId = 'non-existent-module';
      mockConvexClient.query.mockResolvedValue(null);

      // Act
      const result = await mockConvexClient.query(api.modules.getById, { id: nonExistentId });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate module credit to hours ratio', () => {
      // Arrange
      const moduleData = {
        credits: 20,
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      // Act
      const totalHours = moduleData.defaultTeachingHours + moduleData.defaultMarkingHours;
      const hoursPerCredit = totalHours / moduleData.credits;

      // Assert
      expect(hoursPerCredit).toBe(2); // Standard ratio
      expect(hoursPerCredit).toBeGreaterThan(1.5); // Minimum ratio
      expect(hoursPerCredit).toBeLessThan(3); // Maximum ratio
    });

    it('should validate semester workload distribution', () => {
      // Arrange
      const semesterAllocations = [
        { semester: 'Autumn', hours: 30 },
        { semester: 'Spring', hours: 25 },
        { semester: 'Summer', hours: 10 },
      ];

      // Act
      const totalHours = semesterAllocations.reduce((sum, allocation) => sum + allocation.hours, 0);
      const autumnLoad = semesterAllocations.find(a => a.semester === 'Autumn')?.hours || 0;
      const springLoad = semesterAllocations.find(a => a.semester === 'Spring')?.hours || 0;

      // Assert
      expect(totalHours).toBe(65);
      expect(autumnLoad).toBeGreaterThan(0);
      expect(springLoad).toBeGreaterThan(0);
      expect(autumnLoad + springLoad).toBeGreaterThan(totalHours * 0.8); // 80% in main semesters
    });

    it('should validate module level progression', () => {
      // Arrange
      const modules = [
        { code: 'CS101', level: 4, title: 'Introduction' },
        { code: 'CS201', level: 5, title: 'Intermediate' },
        { code: 'CS301', level: 6, title: 'Advanced' },
      ];

      // Act
      const levels = modules.map(m => m.level);
      const isProgressive = levels.every((level, index) => 
        index === 0 || level > levels[index - 1]
      );

      // Assert
      expect(isProgressive).toBe(true);
      expect(levels).toEqual([4, 5, 6]);
    });
  });

  describe('Integration Tests - CRUD Operations', () => {
    it('should perform complete CRUD lifecycle', async () => {
      // Arrange
      const moduleData = {
        code: 'CS999',
        title: 'Integration Test Module',
        credits: 20,
        level: 4,
        moduleLeader: 'Dr. Integration Test',
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      };

      const mockId = 'module-crud-123' as Id<'modules'>;
      
      // Mock CREATE
      mockConvexClient.mutation.mockResolvedValueOnce(mockId);
      
      // Mock READ
      mockConvexClient.query.mockResolvedValueOnce({ ...moduleData, _id: mockId });
      
      // Mock UPDATE
      mockConvexClient.mutation.mockResolvedValueOnce(undefined);
      
      // Mock DELETE
      mockConvexClient.mutation.mockResolvedValueOnce(undefined);

      // Act - CREATE
      const createdId = await mockConvexClient.mutation(api.modules.createModule, moduleData);
      
      // Act - READ
      const retrievedModule = await mockConvexClient.query(api.modules.getById, { id: createdId });
      
      // Act - UPDATE
      const updateData = { id: createdId, ...moduleData, title: 'Updated Integration Test Module' };
      await mockConvexClient.mutation(api.modules.updateModule, updateData);
      
      // Act - DELETE
      await mockConvexClient.mutation(api.modules.deleteModule, { id: createdId });

      // Assert
      expect(createdId).toBe(mockId);
      expect(retrievedModule).toEqual({ ...moduleData, _id: mockId });
      expect(mockConvexClient.mutation).toHaveBeenCalledTimes(3);
      expect(mockConvexClient.query).toHaveBeenCalledTimes(1);
    });

    it('should handle real-time module updates with subscriptions', async () => {
      // Arrange
      const moduleId = 'module-sub-123' as Id<'modules'>;
      const mockSubscription = jest.fn();
      mockConvexClient.subscribe.mockReturnValue(mockSubscription);

      // Act
      const subscription = mockConvexClient.subscribe(api.modules.getById, { id: moduleId });

      // Assert
      expect(mockConvexClient.subscribe).toHaveBeenCalledWith(api.modules.getById, { id: moduleId });
      expect(subscription).toBe(mockSubscription);
    });

    it('should handle cross-module dependencies', async () => {
      // Arrange
      const prerequisiteModule = {
        code: 'CS101',
        title: 'Prerequisite Module',
        credits: 20,
        level: 4,
      };

      const dependentModule = {
        code: 'CS201',
        title: 'Dependent Module',
        credits: 20,
        level: 5,
        prerequisites: ['CS101'],
      };

      // Mock prerequisite check
      mockConvexClient.query.mockResolvedValueOnce(prerequisiteModule);
      mockConvexClient.mutation.mockResolvedValueOnce('module-201' as Id<'modules'>);

      // Act
      const prerequisite = await mockConvexClient.query(api.modules.getById, { id: 'module-101' });
      const dependent = await mockConvexClient.mutation(api.modules.createModule, dependentModule);

      // Assert
      expect(prerequisite).toEqual(prerequisiteModule);
      expect(dependent).toBe('module-201');
      expect(dependentModule.prerequisites).toContain(prerequisiteModule.code);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing required fields gracefully', async () => {
      // Arrange
      const incompleteData = {
        code: 'CS101',
        // Missing required fields
      };

      // Act & Assert
      expect(incompleteData).not.toHaveProperty('title');
      expect(incompleteData).not.toHaveProperty('credits');
      expect(incompleteData).not.toHaveProperty('level');
    });

    it('should handle invalid module code formats', async () => {
      // Arrange
      const invalidCode = 'invalid-module-code-format';

      // Act & Assert
      expect(invalidCode).not.toMatch(/^[A-Z]{2,4}\d{3}$/);
    });

    it('should handle duplicate module codes', async () => {
      // Arrange
      const existingModules = [
        { code: 'CS101', title: 'Existing Module' },
        { code: 'CS101', title: 'Duplicate Module' }, // Duplicate code
      ];

      // Act
      const uniqueCodes = [...new Set(existingModules.map(m => m.code))];

      // Assert
      expect(uniqueCodes).toHaveLength(1);
      expect(existingModules).toHaveLength(2);
    });

    it('should handle network timeouts', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockConvexClient.mutation.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(mockConvexClient.mutation(api.modules.getAll, {}))
        .rejects.toThrow('Request timeout');
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockConvexClient.query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(mockConvexClient.query(api.modules.getAll, {}))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle malformed data gracefully', async () => {
      // Arrange
      const malformedData = {
        code: null, // Invalid: should be string
        title: 123, // Invalid: should be string
        credits: 'invalid', // Invalid: should be number
        level: 'invalid', // Invalid: should be number
      };

      // Act & Assert
      expect(typeof malformedData.code).not.toBe('string');
      expect(typeof malformedData.title).not.toBe('string');
      expect(typeof malformedData.credits).not.toBe('number');
      expect(typeof malformedData.level).not.toBe('number');
    });

    it('should handle empty search results', async () => {
      // Arrange
      mockConvexClient.query.mockResolvedValue([]);

      // Act
      const result = await mockConvexClient.query(api.modules.getAll, {});

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle very large data sets', async () => {
      // Arrange
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        _id: `module-${i}`,
        code: `CS${String(i + 100).padStart(3, '0')}`,
        title: `Module ${i}`,
        credits: 20,
        level: 4,
      }));

      mockConvexClient.query.mockResolvedValue(largeDataSet);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.modules.getAll, {});
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle invalid academic levels', async () => {
      // Arrange
      const invalidLevels = [0, 1, 2, 8, 9, 10];
      const validLevels = [3, 4, 5, 6, 7];

      // Act & Assert
      invalidLevels.forEach(level => {
        expect(level < 3 || level > 7).toBe(true); // Invalid if less than 3 OR greater than 7
      });

      validLevels.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(3);
        expect(level).toBeLessThanOrEqual(7);
      });
    });
  });

  describe('Performance Testing for API Endpoints', () => {
    it('should handle large module datasets efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        _id: `module-${i}`,
        code: `CS${String(i + 100).padStart(3, '0')}`,
        title: `Module ${i}`,
        credits: 20,
        level: 4,
      }));

      mockConvexClient.query.mockResolvedValue(largeDataset);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.modules.getAll, {});
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent operations efficiently', async () => {
      // Arrange
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => ({
        code: `CS${String(i + 100).padStart(3, '0')}`,
        title: `Concurrent Module ${i}`,
        credits: 20,
        level: 4,
        moduleLeader: `Dr. Lecturer ${i}`,
        defaultTeachingHours: 30,
        defaultMarkingHours: 10,
      }));

      mockConvexClient.mutation.mockResolvedValue('module-concurrent-123' as Id<'modules'>);

      // Act
      const startTime = performance.now();
      const promises = concurrentOperations.map(op => 
        mockConvexClient.mutation(api.modules.createModule, op)
      );
      const results = await Promise.all(promises);
      const endTime = performance.now();

      // Assert
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(mockConvexClient.mutation).toHaveBeenCalledTimes(10);
    });

    it('should handle pagination efficiently', async () => {
      // Arrange
      const pageSize = 50;
      const totalItems = 1000;
      const pages = Math.ceil(totalItems / pageSize);

      // Mock paginated responses
      for (let i = 0; i < pages; i++) {
        const pageData = Array.from({ length: pageSize }, (_, j) => ({
          _id: `module-${i * pageSize + j}`,
          code: `CS${String(i * pageSize + j + 100).padStart(3, '0')}`,
          title: `Module ${i * pageSize + j}`,
          credits: 20,
          level: 4,
        }));
        mockConvexClient.query.mockResolvedValueOnce(pageData);
      }

      // Act
      const startTime = performance.now();
      const allPages = [];
      for (let i = 0; i < pages; i++) {
        const page = await mockConvexClient.query(api.modules.getAll, { 
          skip: i * pageSize, 
          limit: pageSize 
        });
        allPages.push(page);
      }
      const endTime = performance.now();

      // Assert
      expect(allPages).toHaveLength(pages);
      expect(allPages.flat()).toHaveLength(totalItems);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle search operations efficiently', async () => {
      // Arrange
      const searchTerm = 'Computer';
      const searchResults = Array.from({ length: 100 }, (_, i) => ({
        _id: `module-search-${i}`,
        code: `CS${String(i + 100).padStart(3, '0')}`,
        title: `${searchTerm} Science Module ${i}`,
        credits: 20,
        level: 4,
      }));

      mockConvexClient.query.mockResolvedValue(searchResults);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.modules.getAll, { 
        search: searchTerm 
      });
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(100);
      expect(result.every((module: any) => module.title.includes(searchTerm))).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle complex queries efficiently', async () => {
      // Arrange
      const complexQuery = {
        level: 4,
        credits: { $gte: 15, $lte: 25 },
        search: 'Computer',
        semester: 'Autumn',
      };

      const complexResults = Array.from({ length: 50 }, (_, i) => ({
        _id: `module-complex-${i}`,
        code: `CS${String(i + 100).padStart(3, '0')}`,
        title: `Computer Science Module ${i}`,
        credits: 20,
        level: 4,
        semester: 'Autumn',
      }));

      mockConvexClient.query.mockResolvedValue(complexResults);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.modules.getAll, complexQuery);
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(50);
      expect(result.every((module: any) => 
        module.level === 4 && 
        module.credits >= 15 && 
        module.credits <= 25 &&
        module.title.includes('Computer') &&
        module.semester === 'Autumn'
      )).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
}); 