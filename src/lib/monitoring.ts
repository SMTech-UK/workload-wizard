import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

// System monitoring service
export class SystemMonitor {
  private static instance: SystemMonitor;
  private metricsInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  // Start monitoring
  startMonitoring(storeMetrics: (metrics: any) => Promise<any>) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        await storeMetrics(metrics);
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    this.isRunning = false;
  }

  // Collect system metrics
  private async collectMetrics() {
    const startTime = performance.now();
    
    try {
      // Simulate API request to measure response time
      const response = await fetch('/api/monitoring/health');
      const responseTime = performance.now() - startTime;

      // Get basic system info
      const memoryInfo = this.getMemoryInfo();
      const cpuInfo = await this.getCpuInfo();

      return {
        activeUsers: await this.getActiveUsers(),
        totalUsers: await this.getTotalUsers(),
        databaseQueries: await this.getDatabaseQueries(),
        apiRequests: await this.getApiRequests(),
        errorRate: await this.getErrorRate(),
        responseTime: Math.round(responseTime),
        memoryUsage: memoryInfo.usedPercentage,
        cpuUsage: cpuInfo.usage,
      };
    } catch (error) {
      console.error('Error collecting metrics:', error);
      return {
        activeUsers: 0,
        totalUsers: 0,
        databaseQueries: 0,
        apiRequests: 0,
        errorRate: 100,
        responseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      };
    }
  }

  // Get memory information
  private getMemoryInfo() {
    if (typeof window !== 'undefined') {
      // Browser environment
      const memory = (performance as any).memory;
      if (memory) {
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        return {
          used: used,
          total: total,
          usedPercentage: Math.round((used / total) * 100),
        };
      }
    }
    
    // Fallback values
    return {
      used: 0,
      total: 0,
      usedPercentage: Math.round(Math.random() * 30) + 20, // Simulate 20-50% usage
    };
  }

  // Get CPU information
  private async getCpuInfo() {
    // In a real implementation, you'd get this from the server
    // For now, we'll simulate CPU usage
    return {
      usage: Math.round(Math.random() * 40) + 10, // Simulate 10-50% usage
    };
  }

  // Get active users (simulated)
  private async getActiveUsers(): Promise<number> {
    try {
      const response = await fetch('/api/monitoring/users/active');
      const data = await response.json();
      return data.count || 0;
    } catch {
      return Math.round(Math.random() * 50) + 10; // Simulate 10-60 active users
    }
  }

  // Get total users (simulated)
  private async getTotalUsers(): Promise<number> {
    try {
      const response = await fetch('/api/monitoring/users/total');
      const data = await response.json();
      return data.count || 0;
    } catch {
      return Math.round(Math.random() * 200) + 100; // Simulate 100-300 total users
    }
  }

  // Get database queries (simulated)
  private async getDatabaseQueries(): Promise<number> {
    return Math.round(Math.random() * 1000) + 100; // Simulate 100-1100 queries
  }

  // Get API requests (simulated)
  private async getApiRequests(): Promise<number> {
    return Math.round(Math.random() * 500) + 50; // Simulate 50-550 requests
  }

  // Get error rate (simulated)
  private async getErrorRate(): Promise<number> {
    return Math.round((Math.random() * 2) * 100) / 100; // Simulate 0-2% error rate
  }
}

// Health check endpoint
export async function healthCheck() {
  try {
    const response = await fetch('/api/monitoring/health');
    return response.ok;
  } catch {
    return false;
  }
} 