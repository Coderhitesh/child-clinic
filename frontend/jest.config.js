const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
});
