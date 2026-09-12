const dotenv = require('dotenv');

const TEST_DATABASE_NAME = 'project_management_test';

const configureTestDatabase = () => {
  dotenv.config();

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error(
      'TEST_DATABASE_URL must be configured for tests and must point to the project_management_test database.',
    );
  }

  let databaseUrl;
  try {
    databaseUrl = new URL(testDatabaseUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid MySQL connection URL.');
  }

  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
  if (databaseUrl.protocol !== 'mysql:' || databaseName !== TEST_DATABASE_NAME) {
    throw new Error(
      'TEST_DATABASE_URL must point to the MySQL project_management_test database. Tests never run against DATABASE_URL.',
    );
  }

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = testDatabaseUrl;
};

module.exports = { TEST_DATABASE_NAME, configureTestDatabase };
