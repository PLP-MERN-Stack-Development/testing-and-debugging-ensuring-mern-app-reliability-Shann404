// jest.config.js - Root Jest configuration file

module.exports = {
  // Base configuration for all tests
  projects: [
    // Server-side tests configuration
    {
      displayName: 'server',
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/**/*.test.js'],
      moduleFileExtensions: ['js', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],
      globalSetup: '<rootDir>/server/tests/setup/globalSetup.js',
      globalTeardown: '<rootDir>/server/tests/setup/globalTeardown.js',
      coverageDirectory: '<rootDir>/coverage/server',
      collectCoverageFrom: [
        'server/src/**/*.js',
        '!server/src/config/**',
        '!**/node_modules/**',
        '!**/*.test.js',
      ],

        setupFilesAfterEnv: ['<rootDir>/server/tests/setup-api.js'],


      coverageReporters: [
        'text', 
        'text-summary', 
        'lcov', 
        'clover', 
        'html',
        'json'
      ],
      testPathIgnorePatterns: ['/node_modules/', '/client/'],
      
    },
    
    // Client-side tests configuration
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.{js,jsx}'],
      moduleFileExtensions: ['js', 'jsx', 'json'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/client/src/tests/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js'], // Fixed path
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      coverageDirectory: '<rootDir>/coverage/client',
      collectCoverageFrom: [
        'client/src/**/*.{js,jsx}',
        '!client/src/index.js',
        '!client/src/reportWebVitals.js',
        '!**/node_modules/**',
        '!**/*.test.{js,jsx}',
      ],

       coverageReporters: [
        'text', 
        'text-summary', 
        'lcov', 
        'clover', 
        'html',
        'json'
      ],
     testPathIgnorePatterns: ['/node_modules/', '/server/'],

    },
  ],
  
  // Global coverage configuration
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
}; 