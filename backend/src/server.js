require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');

const requiredEnvironmentVariables = ['DATABASE_URL', 'JWT_SECRET'];
const missingVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]);
if (missingVariables.length) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  server.close(() => prisma.$disconnect().finally(() => process.exit(0)));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
