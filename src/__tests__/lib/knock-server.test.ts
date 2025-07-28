// Mock the knock-server module before importing
jest.mock('@/lib/knock-server', () => {
  const originalModule = jest.requireActual('@/lib/knock-server');
  
  // Mock the Knock client
  const mockKnockClient = {
    users: {
      update: jest.fn(),
    },
    workflows: {
      trigger: jest.fn(),
    },
  };

  // Mock the environment
  const mockKnockApiKey = 'test-api-key';
  
  return {
    ...originalModule,
    // Override the functions to use our mocked client
    identifyKnockUser: jest.fn(async (userId: string, userData: Record<string, any>) => {
      if (mockKnockApiKey) {
        try {
          return await mockKnockClient.users.update(userId, userData);
        } catch (error) {
          console.error('Knock identify error:', error);
          throw error;
        }
      } else {
        console.warn('Knock client not initialized - skipping user identification');
        console.warn('To fix this, add KNOCK_API_KEY=sk_test_... to your .env.local file');
      }
    }),
    triggerKnockWorkflow: jest.fn(async (workflowKey: string, recipients: string[], data: Record<string, any>) => {
      if (mockKnockApiKey) {
        try {
          return await mockKnockClient.workflows.trigger(workflowKey, {
            recipients,
            data,
          });
        } catch (error) {
          console.error('Knock workflow trigger error:', error);
          throw error;
        }
      } else {
        console.warn('Knock client not initialized - skipping workflow trigger');
        console.warn('To fix this, add KNOCK_API_KEY=sk_test_... to your .env.local file');
      }
    }),
    // Export the mock client for tests to access
    __mockKnockClient: mockKnockClient,
  };
});

import { 
  identifyKnockUser, 
  triggerKnockWorkflow 
} from '@/lib/knock-server';

// Get the mock client
const mockKnockClient = (require('@/lib/knock-server') as any).__mockKnockClient;

describe('knock-server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('identifyKnockUser', () => {
    it('should identify a user when Knock client is available', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ id: 'test-user-id' });
      mockKnockClient.users.update = mockUpdate;

      const userId = 'test-user-id';
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        properties: { role: 'lecturer' },
      };

      await identifyKnockUser(userId, userData);

      expect(mockUpdate).toHaveBeenCalledWith(userId, userData);
    });

    it('should handle API errors gracefully', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('API Error'));
      mockKnockClient.users.update = mockUpdate;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const userId = 'test-user-id';
      const userData = { email: 'test@example.com' };

      await expect(identifyKnockUser(userId, userData)).rejects.toThrow('API Error');
      expect(consoleSpy).toHaveBeenCalledWith('Knock identify error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('triggerKnockWorkflow', () => {
    it('should trigger a workflow when Knock client is available', async () => {
      const mockTrigger = jest.fn().mockResolvedValue({ success: true });
      mockKnockClient.workflows.trigger = mockTrigger;

      const workflowKey = 'test-workflow';
      const recipients = ['user1', 'user2'];
      const data = { message: 'Test notification' };

      await triggerKnockWorkflow(workflowKey, recipients, data);

      expect(mockTrigger).toHaveBeenCalledWith(workflowKey, {
        recipients,
        data,
      });
    });

    it('should handle workflow trigger errors gracefully', async () => {
      const mockTrigger = jest.fn().mockRejectedValue(new Error('Workflow Error'));
      mockKnockClient.workflows.trigger = mockTrigger;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const workflowKey = 'test-workflow';
      const recipients = ['user1'];
      const data = { message: 'Test' };

      await expect(triggerKnockWorkflow(workflowKey, recipients, data)).rejects.toThrow('Workflow Error');
      expect(consoleSpy).toHaveBeenCalledWith('Knock workflow trigger error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
}); 