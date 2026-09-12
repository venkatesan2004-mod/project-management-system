const { spawnSync } = require('child_process');
const { configureTestDatabase } = require('./test-database');

configureTestDatabase();

const run = (command, args) => {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};

// Apply only committed migrations to the isolated test database before Jest
// creates integration-test records.
run('npx', ['--no-install', 'prisma', 'migrate', 'deploy']);
run('npx', ['--no-install', 'jest', '--runInBand']);
