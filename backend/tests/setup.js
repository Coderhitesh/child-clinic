// Tests never touch Mongo, Redis or a real SMTP/SMS provider.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!!';
process.env.FRONTEND_BASE_URL = 'http://localhost:3000';
