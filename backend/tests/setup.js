const { configureTestDatabase } = require('../scripts/test-database');

configureTestDatabase();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-long-enough';
process.env.JWT_EXPIRES_IN = '1h';
