"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Code, 
  Database, 
  Zap, 
  Save, 
  RefreshCw, 
  Download,
  Upload,
  Shield,
  Palette,
  Server,
  Network,
  AlertTriangle
} from 'lucide-react';

interface DevSettings {
  enableDevMode: boolean;
  showDebugInfo: boolean;
  enableHotReload: boolean;
  autoSave: boolean;
  enablePerformanceMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  cacheEnabled: boolean;
  cacheSize: number;
  enableQueryLogging: boolean;
  enableSlowQueryAlert: boolean;
  maxQueryTime: number;
  enableDatabaseMetrics: boolean;
  enableApiLogging: boolean;
  enableRateLimiting: boolean;
  apiTimeout: number;
  enableMockData: boolean;
  theme: 'light' | 'dark' | 'system';
  enableAnimations: boolean;
  compactMode: boolean;
  showTooltips: boolean;
  enableSecurityLogging: boolean;
  enableAuditTrail: boolean;
  strictMode: boolean;
  enableTestMode: boolean;
  autoRunTests: boolean;
  testCoverage: boolean;
  mockApiResponses: boolean;
}

const defaultSettings: DevSettings = {
  enableDevMode: true,
  showDebugInfo: true,
  enableHotReload: true,
  autoSave: true,
  enablePerformanceMonitoring: true,
  logLevel: 'info',
  cacheEnabled: true,
  cacheSize: 100,
  enableQueryLogging: true,
  enableSlowQueryAlert: true,
  maxQueryTime: 1000,
  enableDatabaseMetrics: true,
  enableApiLogging: true,
  enableRateLimiting: false,
  apiTimeout: 5000,
  enableMockData: false,
  theme: 'system',
  enableAnimations: true,
  compactMode: false,
  showTooltips: true,
  enableSecurityLogging: true,
  enableAuditTrail: false,
  strictMode: false,
  enableTestMode: false,
  autoRunTests: false,
  testCoverage: true,
  mockApiResponses: false,
};

export default function DevSettingsModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [settings, setSettings] = useState<DevSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('devSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('devSettings', JSON.stringify(settings));
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dev-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...defaultSettings, ...imported });
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error('Failed to parse imported settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = <K extends keyof DevSettings>(
    key: K, 
    value: DevSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const systemInfo = {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    memory: (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
    } : null,
  };

  const tabConfig = [
    { id: 'general', label: 'General', icon: Settings, color: 'blue' },
    { id: 'performance', label: 'Performance', icon: Zap, color: 'yellow' },
    { id: 'database', label: 'Database', icon: Database, color: 'green' },
    { id: 'api', label: 'API', icon: Network, color: 'purple' },
    { id: 'ui', label: 'UI', icon: Palette, color: 'pink' },
    { id: 'security', label: 'Security', icon: Shield, color: 'red' },
    { id: 'testing', label: 'Testing', icon: Code, color: 'indigo' },
    { id: 'system', label: 'System Info', icon: Server, color: 'gray' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Settings className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white">Development Settings</span>
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Configure your development environment and preferences
              </span>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="ml-auto bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800 px-3 py-1">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Unsaved Changes
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Sidebar Navigation */}
          <div className="w-80 border-r bg-gray-50/50 dark:bg-gray-900/50">
            <div className="p-6 border-b bg-white dark:bg-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Settings Categories</h3>
              <div className="space-y-2">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 justify-start h-14 px-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border rounded-lg transition-colors ${
                        activeTab === tab.id ? `border-${tab.color}-500 bg-${tab.color}-50 dark:bg-${tab.color}-950/20` : ''
                      }`}
                    >
                      <Icon className={`w-5 h-5 text-${tab.color}-600`} />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 dark:text-white">{tab.label}</span>
                        <span className="text-xs text-gray-500">Configuration</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 bg-white dark:bg-gray-900">
            <div className="h-full flex flex-col">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {tabConfig.find(tab => tab.id === activeTab)?.label} Settings
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Configure your development environment settings
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === 'general' && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <Settings className="w-6 h-6 text-blue-600" />
                        General Configuration
                      </CardTitle>
                      <CardDescription className="text-base">Basic development environment settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                          <div className="flex-1">
                            <Label htmlFor="devMode" className="text-base font-semibold text-gray-900 dark:text-white">Enable Dev Mode</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enable development features and debugging tools</p>
                          </div>
                          <Switch
                            id="devMode"
                            checked={settings.enableDevMode}
                            onCheckedChange={(checked) => updateSetting('enableDevMode', checked)}
                            className="ml-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                          <div className="flex-1">
                            <Label htmlFor="debugInfo" className="text-base font-semibold text-gray-900 dark:text-white">Show Debug Info</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Display debug information in the user interface</p>
                          </div>
                          <Switch
                            id="debugInfo"
                            checked={settings.showDebugInfo}
                            onCheckedChange={(checked) => updateSetting('showDebugInfo', checked)}
                            className="ml-4"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'system' && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <Server className="w-6 h-6 text-gray-600" />
                        System Information
                      </CardTitle>
                      <CardDescription className="text-base">Current system and environment details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                          <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Environment</Label>
                          <div className="font-mono text-lg mt-2 font-bold text-gray-900 dark:text-white">{systemInfo.environment}</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                          <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Version</Label>
                          <div className="font-mono text-lg mt-2 font-bold text-gray-900 dark:text-white">{systemInfo.version}</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                          <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Platform</Label>
                          <div className="font-mono text-lg mt-2 font-bold text-gray-900 dark:text-white">{systemInfo.platform}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={saveSettings} 
                      disabled={!hasUnsavedChanges}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-semibold"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Settings
                    </Button>
                    <Button 
                      onClick={resetSettings} 
                      variant="outline"
                      className="px-6 py-3 text-base font-semibold"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={exportSettings} 
                      variant="outline"
                      size="sm"
                      className="px-4 py-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm" className="px-4 py-2">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 