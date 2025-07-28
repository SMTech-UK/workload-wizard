const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/index.ts',
    '!src/**/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Enable concurrent tests for better performance
  maxWorkers: '50%',
  // Enable fake timers globally to fix waitFor issues
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: false,
  },
  // Increase timeout for async tests
  testTimeout: 15000,
  // Enable verbose output for better debugging
  verbose: true,
  // Add test location for better error reporting
  testLocationInResults: true,
  // Enable bail on first failure for CI
  bail: process.env.CI ? 1 : 0,
  // Enable test isolation
  injectGlobals: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 