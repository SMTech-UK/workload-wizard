import { 
  SystemMonitor,
  healthCheck 
} from '@/lib/monitoring';

// Mock fetch
global.fetch = jest.fn();

describe('monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SystemMonitor', () => {
    let monitor: SystemMonitor;

    beforeEach(() => {
      monitor = SystemMonitor.getInstance();
    });

    afterEach(() => {
      monitor.stopMonitoring();
    });

    describe('getInstance', () => {
      it('should return the same instance', () => {
        const instance1 = SystemMonitor.getInstance();
        const instance2 = SystemMonitor.getInstance();
        expect(instance1).toBe(instance2);
      });
    });

    describe('startMonitoring', () => {
      it('should start monitoring when not already running', () => {
        const mockStoreMetrics = jest.fn().mockResolvedValue(undefined);
        
        monitor.startMonitoring(mockStoreMetrics);
        
        expect(monitor['isRunning']).toBe(true);
      });

      it('should not start monitoring if already running', () => {
        const mockStoreMetrics = jest.fn().mockResolvedValue(undefined);
        
        monitor.startMonitoring(mockStoreMetrics);
        monitor.startMonitoring(mockStoreMetrics); // Second call
        
        expect(monitor['isRunning']).toBe(true);
      });
    });

    describe('stopMonitoring', () => {
      it('should stop monitoring and clear interval', () => {
        const mockStoreMetrics = jest.fn().mockResolvedValue(undefined);
        
        monitor.startMonitoring(mockStoreMetrics);
        monitor.stopMonitoring();
        
        expect(monitor['isRunning']).toBe(false);
        expect(monitor['metricsInterval']).toBeNull();
      });
    });

    describe('collectMetrics', () => {
      it('should collect system metrics successfully', async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);
        
        const metrics = await monitor['collectMetrics']();
        
        expect(metrics).toHaveProperty('activeUsers');
        expect(metrics).toHaveProperty('totalUsers');
        expect(metrics).toHaveProperty('databaseQueries');
        expect(metrics).toHaveProperty('apiRequests');
        expect(metrics).toHaveProperty('errorRate');
        expect(metrics).toHaveProperty('responseTime');
        expect(metrics).toHaveProperty('memoryUsage');
        expect(metrics).toHaveProperty('cpuUsage');
      });

      it('should handle errors gracefully and return fallback metrics', async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const metrics = await monitor['collectMetrics']();
        
        expect(metrics).toEqual({
          activeUsers: 0,
          totalUsers: 0,
          databaseQueries: 0,
          apiRequests: 0,
          errorRate: 100,
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
        });
        
        consoleSpy.mockRestore();
      });
    });

    describe('getMemoryInfo', () => {
      it('should return memory information', () => {
        const memoryInfo = monitor['getMemoryInfo']();
        
        expect(memoryInfo).toHaveProperty('used');
        expect(memoryInfo).toHaveProperty('total');
        expect(memoryInfo).toHaveProperty('usedPercentage');
        expect(typeof memoryInfo.usedPercentage).toBe('number');
      });
    });

    describe('getCpuInfo', () => {
      it('should return CPU information', async () => {
        const cpuInfo = await monitor['getCpuInfo']();
        
        expect(cpuInfo).toHaveProperty('usage');
        expect(typeof cpuInfo.usage).toBe('number');
        expect(cpuInfo.usage).toBeGreaterThanOrEqual(10);
        expect(cpuInfo.usage).toBeLessThanOrEqual(50);
      });
    });

    describe('getActiveUsers', () => {
      it('should return active users count from API', async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ count: 25 }),
        } as unknown as Response);
        
        const activeUsers = await monitor['getActiveUsers']();
        
        expect(activeUsers).toBe(25);
        expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/users/active');
      });

      it('should return fallback value when API fails', async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockRejectedValueOnce(new Error('API Error'));
        
        const activeUsers = await monitor['getActiveUsers']();
        
        expect(typeof activeUsers).toBe('number');
        expect(activeUsers).toBeGreaterThanOrEqual(10);
        expect(activeUsers).toBeLessThanOrEqual(60);
      });
    });

    describe('getTotalUsers', () => {
      it('should return total users count from API', async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ count: 150 }),
        } as unknown as Response);
        
        const totalUsers = await monitor['getTotalUsers']();
        
        expect(totalUsers).toBe(150);
        expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/users/total');
      });

      it('should return fallback value when API fails', async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockRejectedValueOnce(new Error('API Error'));
        
        const totalUsers = await monitor['getTotalUsers']();
        
        expect(typeof totalUsers).toBe('number');
        expect(totalUsers).toBeGreaterThanOrEqual(100);
        expect(totalUsers).toBeLessThanOrEqual(300);
      });
    });

    describe('getDatabaseQueries', () => {
      it('should return simulated database queries count', async () => {
        const queries = await monitor['getDatabaseQueries']();
        
        expect(typeof queries).toBe('number');
        expect(queries).toBeGreaterThanOrEqual(100);
        expect(queries).toBeLessThanOrEqual(1100);
      });
    });

    describe('getApiRequests', () => {
      it('should return simulated API requests count', async () => {
        const requests = await monitor['getApiRequests']();
        
        expect(typeof requests).toBe('number');
        expect(requests).toBeGreaterThanOrEqual(50);
        expect(requests).toBeLessThanOrEqual(550);
      });
    });

    describe('getErrorRate', () => {
      it('should return simulated error rate', async () => {
        const errorRate = await monitor['getErrorRate']();
        
        expect(typeof errorRate).toBe('number');
        expect(errorRate).toBeGreaterThanOrEqual(0);
        expect(errorRate).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true when health check succeeds', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({ ok: true } as Response);
      
      const result = await healthCheck();
      
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/health');
    });

    it('should return false when health check fails', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({ ok: false } as Response);
      
      const result = await healthCheck();
      
      expect(result).toBe(false);
    });

    it('should return false when health check throws error', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await healthCheck();
      
      expect(result).toBe(false);
    });
  });
}); 