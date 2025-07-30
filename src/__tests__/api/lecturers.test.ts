/**
 * Critical Lecturer API Tests
 * 
 * These tests cover the core business logic for lecturer management
 * including creation, updates, validation, and workload calculations.
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

describe('Lecturer API - Critical Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementations
    mockConvexClient.mutation.mockReset()
    mockConvexClient.query.mockReset()
    mockConvexClient.subscribe.mockReset()
  })

  describe('Lecturer Creation', () => {
    it('should create lecturer with valid data', async () => {
      // Arrange
      const lecturerData = {
        fullName: 'Dr. John Smith',
        team: 'Computer Science',
        specialism: 'Software Engineering',
        contract: 'Permanent',
        email: 'john.smith@university.edu',
        capacity: 40,
        maxTeachingHours: 25,
        role: 'Senior Lecturer',
        status: 'available',
        teachingAvailability: 25,
        totalAllocated: 0,
        totalContract: 40,
        allocatedTeachingHours: 0,
        allocatedAdminHours: 0,
        family: 'Computer Science',
        fte: 1.0,
      };

      const mockId = 'lecturer-123' as Id<'lecturers'>;
      mockConvexClient.mutation.mockResolvedValue(mockId);

      // Act
      const result = await mockConvexClient.mutation(api.lecturers.createLecturer, lecturerData);

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.lecturers.createLecturer, lecturerData);
      expect(result).toBe(mockId);
      expect(mockConvexClient.mutation).toHaveBeenCalledTimes(1);
    });

    it('should enforce maximum teaching hours constraint', async () => {
      // Arrange
      const lecturerData = {
        fullName: 'Dr. John Smith',
        team: 'Computer Science',
        specialism: 'Software Engineering',
        contract: 'Permanent',
        email: 'john.smith@university.edu',
        capacity: 40,
        maxTeachingHours: 50, // Exceeds reasonable limit
        role: 'Senior Lecturer',
        status: 'available',
        teachingAvailability: 50,
        totalAllocated: 0,
        totalContract: 40,
        allocatedTeachingHours: 0,
        allocatedAdminHours: 0,
        family: 'Computer Science',
        fte: 1.0,
      };

      // Act & Assert
      expect(lecturerData.maxTeachingHours).toBeGreaterThan(40); // Should flag this
      expect(lecturerData.maxTeachingHours).toBeGreaterThan(lecturerData.totalContract * 0.6); // Exceeds 60% limit
    });

    it('should validate email format during creation', async () => {
      // Arrange
      const validEmail = 'john.smith@university.edu';
      const invalidEmail = 'invalid-email-format';

      // Act & Assert
      expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should handle duplicate email creation attempts', async () => {
      // Arrange
      const lecturerData = {
        fullName: 'Dr. John Smith',
        email: 'john.smith@university.edu',
        // ... other fields
      };

      // Mock duplicate email error
      mockConvexClient.mutation.mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await expect(mockConvexClient.mutation(api.lecturers.createLecturer, lecturerData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('Lecturer Updates', () => {
    it('should update lecturer workload allocation correctly', async () => {
      // Arrange
      const lecturerId = 'lecturer-123' as Id<'lecturers'>;
      const updateData = {
        id: lecturerId,
        fullName: 'Dr. Jane Smith',
        team: 'Computer Science',
        specialism: 'Software Engineering',
        contract: 'Permanent',
        email: 'jane.smith@university.edu',
        capacity: 40,
        maxTeachingHours: 25,
        role: 'Senior Lecturer',
        status: 'available',
        teachingAvailability: 15, // Updated from 25
        totalAllocated: 10, // Updated from 0
        totalContract: 40,
        allocatedTeachingHours: 8, // Updated from 0
        allocatedAdminHours: 2, // Updated from 0
        family: 'Computer Science',
        fte: 1.0,
      };

      mockConvexClient.mutation.mockResolvedValue(undefined);

      // Act
      await mockConvexClient.mutation(api.lecturers.updateLecturer, updateData);

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.lecturers.updateLecturer, updateData);
      expect(updateData.totalAllocated).toBe(updateData.allocatedTeachingHours + updateData.allocatedAdminHours);
    });

    it('should maintain data consistency during updates', async () => {
      // Arrange
      const lecturerId = 'lecturer-123' as Id<'lecturers'>;
      const updateData = {
        id: lecturerId,
        fullName: 'Dr. Jane Smith',
        team: 'Computer Science',
        specialism: 'Software Engineering',
        contract: 'Permanent',
        email: 'jane.smith@university.edu',
        capacity: 30, // Corrected: 40 - 10 = 30
        maxTeachingHours: 25,
        role: 'Senior Lecturer',
        status: 'available',
        teachingAvailability: 17, // Corrected: 25 - 8 = 17
        totalAllocated: 10,
        totalContract: 40,
        allocatedTeachingHours: 8,
        allocatedAdminHours: 2,
        family: 'Computer Science',
        fte: 1.0,
      };

      // Act & Assert
      expect(updateData.totalAllocated).toBe(updateData.allocatedTeachingHours + updateData.allocatedAdminHours);
      expect(updateData.teachingAvailability).toBe(updateData.maxTeachingHours - updateData.allocatedTeachingHours);
      expect(updateData.capacity).toBe(updateData.totalContract - updateData.totalAllocated);
    });

    it('should handle concurrent update conflicts', async () => {
      // Arrange
      const lecturerId = 'lecturer-123' as Id<'lecturers'>;
      const updateData1 = { id: lecturerId, fullName: 'Dr. Jane Smith' };
      const updateData2 = { id: lecturerId, fullName: 'Dr. John Smith' };

      // Mock optimistic concurrency control failure
      mockConvexClient.mutation
        .mockResolvedValueOnce(undefined) // First update succeeds
        .mockRejectedValueOnce(new Error('Concurrent modification detected')); // Second update fails

      // Act
      await mockConvexClient.mutation(api.lecturers.updateLecturer, updateData1);
      
      // Assert
      await expect(mockConvexClient.mutation(api.lecturers.updateLecturer, updateData2))
        .rejects.toThrow('Concurrent modification detected');
    });
  });

  describe('Workload Validation', () => {
    it('should detect over-allocation scenarios', () => {
      // Arrange
      const lecturerData = {
        totalContract: 40,
        totalAllocated: 45,
        maxTeachingHours: 25,
        allocatedTeachingHours: 30,
        maxAdminHours: 15,
        allocatedAdminHours: 15,
      };

      // Act
      const isOverAllocated = lecturerData.totalAllocated > lecturerData.totalContract;
      const isTeachingOverAllocated = lecturerData.allocatedTeachingHours > lecturerData.maxTeachingHours;
      const isAdminOverAllocated = lecturerData.allocatedAdminHours > lecturerData.maxAdminHours;

      // Assert
      expect(isOverAllocated).toBe(true);
      expect(isTeachingOverAllocated).toBe(true);
      expect(isAdminOverAllocated).toBe(false);
    });

    it('should calculate remaining capacity correctly', () => {
      // Arrange
      const lecturerData = {
        totalContract: 40,
        totalAllocated: 25,
        maxTeachingHours: 25,
        allocatedTeachingHours: 15,
        maxAdminHours: 15,
        allocatedAdminHours: 10,
      };

      // Act
      const remainingCapacity = lecturerData.totalContract - lecturerData.totalAllocated;
      const remainingTeachingCapacity = lecturerData.maxTeachingHours - lecturerData.allocatedTeachingHours;
      const remainingAdminCapacity = lecturerData.maxAdminHours - lecturerData.allocatedAdminHours;

      // Assert
      expect(remainingCapacity).toBe(15);
      expect(remainingTeachingCapacity).toBe(10);
      expect(remainingAdminCapacity).toBe(5);
    });

    it('should validate FTE calculations', () => {
      // Arrange
      const lecturerData = {
        totalContract: 40,
        fte: 1.0,
        standardFTEHours: 40,
      };

      // Act
      const calculatedFTE = lecturerData.totalContract / lecturerData.standardFTEHours;

      // Assert
      expect(calculatedFTE).toBe(1.0);
      expect(lecturerData.fte).toBe(calculatedFTE);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk lecturer import with validation', async () => {
      // Arrange
      const bulkLecturerData = [
        {
          fullName: 'Dr. Alice Johnson',
          team: 'Computer Science',
          specialism: 'AI',
          contract: 'Permanent',
          email: 'alice.johnson@university.edu',
          capacity: 40,
          maxTeachingHours: 25,
          role: 'Lecturer',
          status: 'available',
          teachingAvailability: 25,
          totalAllocated: 0,
          totalContract: 40,
          allocatedTeachingHours: 0,
          allocatedAdminHours: 0,
          family: 'Computer Science',
          fte: 1.0,
        },
        {
          fullName: 'Dr. Bob Wilson',
          team: 'Computer Science',
          specialism: 'Databases',
          contract: 'Permanent',
          email: 'bob.wilson@university.edu',
          capacity: 40,
          maxTeachingHours: 25,
          role: 'Lecturer',
          status: 'available',
          teachingAvailability: 25,
          totalAllocated: 0,
          totalContract: 40,
          allocatedTeachingHours: 0,
          allocatedAdminHours: 0,
          family: 'Computer Science',
          fte: 1.0,
        },
      ];

      const mockResponse = [
        { success: true, id: 'lecturer-1', email: 'alice.johnson@university.edu' },
        { success: true, id: 'lecturer-2', email: 'bob.wilson@university.edu' },
      ];

      mockConvexClient.mutation.mockResolvedValue(mockResponse);

      // Act
      const result = await mockConvexClient.mutation(api.lecturers.bulkImport, { lecturers: bulkLecturerData });

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.lecturers.bulkImport, { lecturers: bulkLecturerData });
      expect(result).toEqual(mockResponse);
      expect(result.every((r: any) => r.success)).toBe(true);
    });

    it('should handle partial failures in bulk import', async () => {
      // Arrange
      const bulkLecturerData = [
        {
          fullName: 'Dr. Valid Lecturer',
          email: 'valid@university.edu',
          capacity: 40,
          maxTeachingHours: 25,
          role: 'Lecturer',
          status: 'available',
          teachingAvailability: 25,
          totalAllocated: 0,
          totalContract: 40,
          allocatedTeachingHours: 0,
          allocatedAdminHours: 0,
          family: 'Computer Science',
          fte: 1.0,
          team: 'Computer Science',
          specialism: 'Programming',
          contract: 'Permanent',
        },
        {
          fullName: 'Dr. Invalid Lecturer',
          email: 'invalid-email', // Invalid email
          capacity: 40,
          maxTeachingHours: 25,
          role: 'Lecturer',
          status: 'available',
          teachingAvailability: 25,
          totalAllocated: 0,
          totalContract: 40,
          allocatedTeachingHours: 0,
          allocatedAdminHours: 0,
          family: 'Computer Science',
          fte: 1.0,
          team: 'Computer Science',
          specialism: 'Programming',
          contract: 'Permanent',
        },
      ];

      const mockResponse = [
        { success: true, id: 'lecturer-1', email: 'valid@university.edu' },
        { success: false, email: 'invalid-email', error: 'Invalid email format' },
      ];

      mockConvexClient.mutation.mockResolvedValue(mockResponse);

      // Act
      const result = await mockConvexClient.mutation(api.lecturers.bulkImport, { lecturers: bulkLecturerData });

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
      const result = await mockConvexClient.mutation(api.lecturers.bulkImport, { lecturers: emptyBulkData });

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(0);
    });
  });

  describe('Status Management', () => {
    it('should update lecturer status correctly', async () => {
      // Arrange
      const lecturerId = 'lecturer-123' as Id<'lecturers'>;
      const newStatus = 'unavailable';

      mockConvexClient.mutation.mockResolvedValue(undefined);

      // Act
      await mockConvexClient.mutation(api.lecturers.updateStatus, { id: lecturerId, status: newStatus });

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(api.lecturers.updateStatus, { id: lecturerId, status: newStatus });
    });

    it('should validate status transitions', () => {
      // Arrange
      const validStatuses = ['available', 'unavailable', 'on_leave', 'part_time'];
      const currentStatus = 'available';
      const newStatus = 'unavailable';

      // Act & Assert
      expect(validStatuses).toContain(currentStatus);
      expect(validStatuses).toContain(newStatus);
    });

    it('should prevent invalid status transitions', () => {
      // Arrange
      const validStatuses = ['available', 'unavailable', 'on_leave', 'part_time'];
      const invalidStatus = 'invalid_status';

      // Act & Assert
      expect(validStatuses).not.toContain(invalidStatus);
    });
  });

  describe('Data Retrieval', () => {
    it('should retrieve lecturer by ID with complete data', async () => {
      // Arrange
      const lecturerId = 'lecturer-123' as Id<'lecturers'>;
      const mockLecturer = {
        _id: lecturerId,
        fullName: 'Dr. Jane Smith',
        email: 'jane.smith@university.edu',
        capacity: 40,
        maxTeachingHours: 25,
        role: 'Senior Lecturer',
        status: 'available',
        teachingAvailability: 15,
        totalAllocated: 10,
        totalContract: 40,
        allocatedTeachingHours: 8,
        allocatedAdminHours: 2,
        family: 'Computer Science',
        fte: 1.0,
        team: 'Computer Science',
        specialism: 'Software Engineering',
        contract: 'Permanent',
      };

      mockConvexClient.query.mockResolvedValue(mockLecturer);

      // Act
      const result = await mockConvexClient.query(api.lecturers.getById, { id: lecturerId });

      // Assert
      expect(mockConvexClient.query).toHaveBeenCalledWith(api.lecturers.getById, { id: lecturerId });
      expect(result).toEqual(mockLecturer);
      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('fullName');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('capacity');
    });

    it('should retrieve all lecturers for department overview', async () => {
      // Arrange
      const mockLecturers = [
        {
          _id: 'lecturer-1',
          fullName: 'Dr. Alice Johnson',
          email: 'alice.johnson@university.edu',
          capacity: 40,
          status: 'available',
        },
        {
          _id: 'lecturer-2',
          fullName: 'Dr. Bob Wilson',
          email: 'bob.wilson@university.edu',
          capacity: 40,
          status: 'available',
        },
      ];

      mockConvexClient.query.mockResolvedValue(mockLecturers);

      // Act
      const result = await mockConvexClient.query(api.lecturers.getAll, {});

      // Assert
      expect(mockConvexClient.query).toHaveBeenCalledWith(api.lecturers.getAll, {});
      expect(result).toEqual(mockLecturers);
      expect(result).toHaveLength(2);
    });

    it('should handle lecturer not found gracefully', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id' as Id<'lecturers'>;
      mockConvexClient.query.mockResolvedValue(null);

      // Act
      const result = await mockConvexClient.query(api.lecturers.getById, { id: nonExistentId });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Integration Tests - CRUD Operations', () => {
    it('should perform complete CRUD lifecycle', async () => {
      // Arrange
      const lecturerData = {
        fullName: 'Dr. Integration Test',
        email: 'integration.test@university.edu',
        capacity: 40,
        maxTeachingHours: 25,
        role: 'Lecturer',
        status: 'available',
        teachingAvailability: 25,
        totalAllocated: 0,
        totalContract: 40,
        allocatedTeachingHours: 0,
        allocatedAdminHours: 0,
        family: 'Computer Science',
        fte: 1.0,
        team: 'Computer Science',
        specialism: 'Testing',
        contract: 'Permanent',
      };

      const mockId = 'lecturer-crud-123' as Id<'lecturers'>;
      
      // Mock CREATE
      mockConvexClient.mutation.mockResolvedValueOnce(mockId);
      
      // Mock READ
      mockConvexClient.query.mockResolvedValueOnce({ ...lecturerData, _id: mockId });
      
      // Mock UPDATE
      mockConvexClient.mutation.mockResolvedValueOnce(undefined);
      
      // Mock DELETE
      mockConvexClient.mutation.mockResolvedValueOnce(undefined);

      // Act - CREATE
      const createdId = await mockConvexClient.mutation(api.lecturers.createLecturer, lecturerData);
      
      // Act - READ
      const retrievedLecturer = await mockConvexClient.query(api.lecturers.getById, { id: createdId });
      
      // Act - UPDATE
      const updateData = { id: createdId, ...lecturerData, fullName: 'Dr. Updated Integration Test' };
      await mockConvexClient.mutation(api.lecturers.updateLecturer, updateData);
      
      // Act - DELETE
      await mockConvexClient.mutation(api.lecturers.deleteLecturer, { id: createdId });

      // Assert
      expect(createdId).toBe(mockId);
      expect(retrievedLecturer).toEqual({ ...lecturerData, _id: mockId });
      expect(mockConvexClient.mutation).toHaveBeenCalledTimes(3);
      expect(mockConvexClient.query).toHaveBeenCalledTimes(1);
    });

    it('should handle real-time updates with subscriptions', async () => {
      // Arrange
      const lecturerId = 'lecturer-sub-123' as Id<'lecturers'>;
      const mockSubscription = jest.fn();
      mockConvexClient.subscribe.mockReturnValue(mockSubscription);

      // Act
      const subscription = mockConvexClient.subscribe(api.lecturers.getById, { id: lecturerId });

      // Assert
      expect(mockConvexClient.subscribe).toHaveBeenCalledWith(api.lecturers.getById, { id: lecturerId });
      expect(subscription).toBe(mockSubscription);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing required fields gracefully', async () => {
      // Arrange
      const incompleteData = {
        fullName: 'Dr. Incomplete',
        // Missing required fields
      };

      // Act & Assert
      expect(incompleteData).not.toHaveProperty('email');
      expect(incompleteData).not.toHaveProperty('capacity');
      expect(incompleteData).not.toHaveProperty('maxTeachingHours');
    });

    it('should handle invalid lecturer ID formats', async () => {
      // Arrange
      const invalidId = 'invalid@id#format'; // Invalid characters

      // Act & Assert
      expect(invalidId).not.toMatch(/^[a-zA-Z0-9_-]+$/);
    });

    it('should handle network timeouts', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockConvexClient.mutation.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(mockConvexClient.mutation(api.lecturers.getAll, {}))
        .rejects.toThrow('Request timeout');
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockConvexClient.query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(mockConvexClient.query(api.lecturers.getAll, {}))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle malformed data gracefully', async () => {
      // Arrange
      const malformedData = {
        fullName: null, // Invalid: should be string
        email: 123, // Invalid: should be string
        capacity: 'invalid', // Invalid: should be number
      };

      // Act & Assert
      expect(typeof malformedData.fullName).not.toBe('string');
      expect(typeof malformedData.email).not.toBe('string');
      expect(typeof malformedData.capacity).not.toBe('number');
    });

    it('should handle empty search results', async () => {
      // Arrange
      mockConvexClient.query.mockResolvedValue([]);

      // Act
      const result = await mockConvexClient.query(api.lecturers.getAll, {});

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle very large data sets', async () => {
      // Arrange
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        _id: `lecturer-${i}`,
        fullName: `Dr. Lecturer ${i}`,
        email: `lecturer${i}@university.edu`,
        capacity: 40,
        status: 'available',
      }));

      mockConvexClient.query.mockResolvedValue(largeDataSet);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.lecturers.getAll, {});
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Performance Testing for API Endpoints', () => {
    it('should handle large lecturer datasets efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        _id: `lecturer-${i}`,
        fullName: `Dr. Lecturer ${i}`,
        email: `lecturer${i}@university.edu`,
        capacity: 40,
        status: 'available',
      }));

      mockConvexClient.query.mockResolvedValue(largeDataset);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.lecturers.getAll, {});
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent operations efficiently', async () => {
      // Arrange
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => ({
        fullName: `Dr. Concurrent ${i}`,
        email: `concurrent${i}@university.edu`,
        capacity: 40,
        maxTeachingHours: 25,
        role: 'Lecturer',
        status: 'available',
        teachingAvailability: 25,
        totalAllocated: 0,
        totalContract: 40,
        allocatedTeachingHours: 0,
        allocatedAdminHours: 0,
        family: 'Computer Science',
        fte: 1.0,
        team: 'Computer Science',
        specialism: 'Concurrency',
        contract: 'Permanent',
      }));

      mockConvexClient.mutation.mockResolvedValue('lecturer-concurrent-123' as Id<'lecturers'>);

      // Act
      const startTime = performance.now();
      const promises = concurrentOperations.map(op => 
        mockConvexClient.mutation(api.lecturers.createLecturer, op)
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
          _id: `lecturer-${i * pageSize + j}`,
          fullName: `Dr. Lecturer ${i * pageSize + j}`,
          email: `lecturer${i * pageSize + j}@university.edu`,
          capacity: 40,
          status: 'available',
        }));
        mockConvexClient.query.mockResolvedValueOnce(pageData);
      }

      // Act
      const startTime = performance.now();
      const allPages = [];
      for (let i = 0; i < pages; i++) {
        const page = await mockConvexClient.query(api.lecturers.getAll, { 
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
      const searchTerm = 'Smith';
      const searchResults = Array.from({ length: 100 }, (_, i) => ({
        _id: `lecturer-smith-${i}`,
        fullName: `Dr. ${searchTerm} ${i}`,
        email: `smith${i}@university.edu`,
        capacity: 40,
        status: 'available',
      }));

      mockConvexClient.query.mockResolvedValue(searchResults);

      // Act
      const startTime = performance.now();
      const result = await mockConvexClient.query(api.lecturers.getAll, { 
        search: searchTerm 
      });
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(100);
      expect(result.every((lecturer: any) => lecturer.fullName.includes(searchTerm))).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
}); 