module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/utils/**/*.js', 'src/services/couponService.js', 'src/middleware/rbac.js'],
};
