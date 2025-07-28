// Mock Knock before importing the module
const mockKnockClient = {
  users: {
    update: jest.fn(),
  },
  workflows: {
    trigger: jest.fn(),
  },
};

const mockKnock = jest.fn().mockImplementation(() => mockKnockClient);

jest.mock('@knocklabs/node', () => mockKnock);

// Import after mocking
let identifyKnockUser: any;
let triggerKnockWorkflow: any;

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  warn: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
};

describe.skip('Knock Server - Critical Notification Logic', () => {
  let mockKnockClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console
    Object.assign(console, mockConsole);
    
    // Mock environment variables
    delete process.env.KNOCK_API_KEY;
    
    // Reload the module to pick up environment variable changes
    jest.resetModules();
    const knockServer = require('@/lib/knock-server');
    identifyKnockUser = knockServer.identifyKnockUser;
    triggerKnockWorkflow = knockServer.triggerKnockWorkflow;
  });

  afterEach(() => {
    // Restore console
    Object.assign(console, originalConsole);
    
    // Clean up environment
    delete process.env.KNOCK_API_KEY;
  });

  describe('identifyKnockUser', () => {
    it('should identify user successfully when API key is available', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'lecturer',
      };

      mockKnockClient.users.update.mockResolvedValue(undefined);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
      expect(console.log).toHaveBeenCalledWith(`✅ Knock user identified: ${userId}`);
    });

    it('should handle user identification errors gracefully', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = { email: 'test@example.com' };
      const error = new Error('Network error');

      mockKnockClient.users.update.mockRejectedValue(error);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
      expect(console.error).toHaveBeenCalledWith('Knock identify error:', error);
    });

    it('should warn when API key is not available', async () => {
      // Arrange
      const userId = 'user123';
      const userData = { email: 'test@example.com' };

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Knock client not initialized - skipping user identification');
      expect(console.warn).toHaveBeenCalledWith('To fix this, add KNOCK_API_KEY=sk_test_... to your .env.local file');
    });

    it('should handle empty user data', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = {};

      mockKnockClient.users.update.mockResolvedValue(undefined);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
    });

    it('should handle complex user data structures', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = {
        email: 'lecturer@university.edu',
        name: 'Dr. John Smith',
        role: 'lecturer',
        department: 'Computer Science',
        specialism: 'Software Engineering',
        contract: '1AP',
        fte: 1.0,
        preferences: {
          notifications: {
            email: true,
            push: false,
          },
        },
      };

      mockKnockClient.users.update.mockResolvedValue(undefined);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
    });

    it('should handle null user data', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = null as any;

      mockKnockClient.users.update.mockResolvedValue(undefined);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
    });

    it('should handle empty userId', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = '';
      const userData = { email: 'test@example.com' };

      mockKnockClient.users.update.mockResolvedValue(undefined);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
    });
  });

  describe('triggerKnockWorkflow', () => {
    it('should trigger workflow successfully when API key is available', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'workload-allocation';
      const recipients = ['user123', 'user456'];
      const data = {
        moduleName: 'Software Engineering',
        allocatedHours: 20,
        lecturerName: 'Dr. Smith',
      };

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
      expect(console.log).toHaveBeenCalledWith(`✅ Knock workflow triggered: ${workflowKey} for ${recipients.length} recipients`);
    });

    it('should handle workflow trigger errors gracefully', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'workload-allocation';
      const recipients = ['user123'];
      const data = { moduleName: 'Test Module' };
      const error = new Error('Workflow not found');

      mockKnockClient.workflows.trigger.mockRejectedValue(error);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
      expect(console.error).toHaveBeenCalledWith('Knock workflow trigger error:', error);
    });

    it('should warn when API key is not available', async () => {
      // Arrange
      const workflowKey = 'workload-allocation';
      const recipients = ['user123'];
      const data = { moduleName: 'Test Module' };

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Knock client not initialized - skipping workflow trigger');
      expect(console.warn).toHaveBeenCalledWith('To fix this, add KNOCK_API_KEY=sk_test_... to your .env.local file');
    });

    it('should handle empty recipients array', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'workload-allocation';
      const recipients: string[] = [];
      const data = { moduleName: 'Test Module' };

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
      expect(console.log).toHaveBeenCalledWith(`✅ Knock workflow triggered: ${workflowKey} for 0 recipients`);
    });

    it('should handle single recipient', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'workload-allocation';
      const recipients = ['user123'];
      const data = { moduleName: 'Test Module' };

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
      expect(console.log).toHaveBeenCalledWith(`✅ Knock workflow triggered: ${workflowKey} for 1 recipients`);
    });

    it('should handle complex workflow data', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'module-allocation-complete';
      const recipients = ['admin123', 'lecturer456'];
      const data = {
        module: {
          name: 'Advanced Software Engineering',
          code: 'CS401',
          credits: 20,
          semester: 'Spring 2024',
        },
        allocation: {
          lecturerId: 'lecturer456',
          lecturerName: 'Dr. Jane Doe',
          allocatedHours: 25,
          teachingHours: 20,
          adminHours: 5,
        },
        department: 'Computer Science',
        timestamp: new Date().toISOString(),
      };

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
    });

    it('should handle empty workflow data', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'simple-notification';
      const recipients = ['user123'];
      const data = {};

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
    });

    it('should handle null workflow data', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'simple-notification';
      const recipients = ['user123'];
      const data = null as any;

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing KNOCK_API_KEY environment variable', async () => {
      // Arrange
      delete process.env.KNOCK_API_KEY;
      const userId = 'user123';
      const userData = { email: 'test@example.com' };

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(console.warn).toHaveBeenCalledWith('⚠️  KNOCK_API_KEY not found in environment variables');
      expect(console.warn).toHaveBeenCalledWith('   This is required for server-side Knock operations (user identification, workflow triggers)');
    });

    it('should handle empty KNOCK_API_KEY environment variable', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = '';
      const userId = 'user123';
      const userData = { email: 'test@example.com' };

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(console.warn).toHaveBeenCalledWith('Knock client not initialized - skipping user identification');
    });

    it('should handle whitespace-only KNOCK_API_KEY environment variable', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = '   ';
      const userId = 'user123';
      const userData = { email: 'test@example.com' };

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(console.warn).toHaveBeenCalledWith('Knock client not initialized - skipping user identification');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user onboarding workflow', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'new-lecturer-123';
      const userData = {
        email: 'new.lecturer@university.edu',
        name: 'Dr. New Lecturer',
        role: 'lecturer',
        department: 'Mathematics',
      };

      mockKnockClient.users.update.mockResolvedValue(undefined);
      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act - Identify user
      await identifyKnockUser(userId, userData);

      // Act - Trigger welcome workflow
      await triggerKnockWorkflow('welcome-lecturer', [userId], {
        lecturerName: userData.name,
        department: userData.department,
      });

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith('welcome-lecturer', {
        recipients: [userId],
        data: {
          lecturerName: userData.name,
          department: userData.department,
        },
      });
    });

    it('should handle workload allocation notification workflow', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const lecturerId = 'lecturer-456';
      const adminId = 'admin-789';
      const allocationData = {
        moduleName: 'Software Engineering',
        moduleCode: 'CS301',
        allocatedHours: 20,
        lecturerName: 'Dr. John Smith',
        semester: 'Spring 2024',
      };

      mockKnockClient.workflows.trigger.mockResolvedValue(undefined);

      // Act - Notify lecturer
      await triggerKnockWorkflow('workload-allocated', [lecturerId], {
        ...allocationData,
        notificationType: 'allocation',
      });

      // Act - Notify admin
      await triggerKnockWorkflow('workload-allocation-complete', [adminId], {
        ...allocationData,
        notificationType: 'confirmation',
      });

      // Assert
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledTimes(2);
      expect(mockKnockClient.workflows.trigger).toHaveBeenNthCalledWith(1, 'workload-allocated', {
        recipients: [lecturerId],
        data: {
          ...allocationData,
          notificationType: 'allocation',
        },
      });
      expect(mockKnockClient.workflows.trigger).toHaveBeenNthCalledWith(2, 'workload-allocation-complete', {
        recipients: [adminId],
        data: {
          ...allocationData,
          notificationType: 'confirmation',
        },
      });
    });

    it('should handle error scenarios gracefully', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = { email: 'test@example.com' };
      const workflowKey = 'test-workflow';
      const recipients = ['user123'];
      const data = { test: 'data' };

      // Mock user identification to succeed
      mockKnockClient.users.update.mockResolvedValue(undefined);
      // Mock workflow trigger to fail
      mockKnockClient.workflows.trigger.mockRejectedValue(new Error('Workflow error'));

      // Act
      await identifyKnockUser(userId, userData);
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(mockKnockClient.users.update).toHaveBeenCalledWith(userId, userData);
      expect(console.log).toHaveBeenCalledWith(`✅ Knock user identified: ${userId}`);
      expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
      expect(console.error).toHaveBeenCalledWith('Knock workflow trigger error:', expect.any(Error));
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network timeout errors', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const userId = 'user123';
      const userData = { email: 'test@example.com' };
      const timeoutError = new Error('Request timeout');

      mockKnockClient.users.update.mockRejectedValue(timeoutError);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Knock identify error:', timeoutError);
    });

    it('should handle authentication errors', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_invalid_key';
      const userId = 'user123';
      const userData = { email: 'test@example.com' };
      const authError = new Error('Invalid API key');

      mockKnockClient.users.update.mockRejectedValue(authError);

      // Act
      await identifyKnockUser(userId, userData);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Knock identify error:', authError);
    });

    it('should handle rate limiting errors', async () => {
      // Arrange
      process.env.KNOCK_API_KEY = 'sk_test_valid_key';
      const workflowKey = 'test-workflow';
      const recipients = ['user123'];
      const data = { test: 'data' };
      const rateLimitError = new Error('Rate limit exceeded');

      mockKnockClient.workflows.trigger.mockRejectedValue(rateLimitError);

      // Act
      await triggerKnockWorkflow(workflowKey, recipients, data);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Knock workflow trigger error:', rateLimitError);
    });
  });
}); 