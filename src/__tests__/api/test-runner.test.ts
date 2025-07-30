// Mock function for testing
const runTests = async () => {
  const response = await fetch('/api/test-runner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Test execution failed');
  }

  return response.json();
};

// Mock fetch globally
global.fetch = jest.fn();

describe('Test Runner API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run tests successfully', async () => {
    const mockResponse = {
      success: true,
      results: {
        passed: 10,
        failed: 2,
        total: 12,
      },
      timestamp: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await runTests();

    expect(global.fetch).toHaveBeenCalledWith('/api/test-runner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const errorResponse = {
      success: false,
      error: 'Test execution failed',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => errorResponse,
    });

    await expect(runTests()).rejects.toThrow('Test execution failed');
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(runTests()).rejects.toThrow('Network error');
  });
}); 