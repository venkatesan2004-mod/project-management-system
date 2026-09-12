const validate = require('../src/middleware/validate.middleware');
const { projectQuerySchema } = require('../src/validators/project.validators');

const validateQuery = (query) => new Promise((resolve) => {
  const req = { query };
  validate(projectQuerySchema, 'query')(req, {}, (error) => resolve({ req, error }));
});

describe('project query validation', () => {
  test.each([
    [{}, { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }],
    [{ page: '1', limit: '10' }, { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }],
    [{ status: 'NOT_STARTED' }, { page: 1, limit: 10, status: 'NOT_STARTED', sortBy: 'createdAt', sortOrder: 'desc' }],
    [{ search: 'Project' }, { page: 1, limit: 10, search: 'Project', sortBy: 'createdAt', sortOrder: 'desc' }],
  ])('stores parsed defaults for query %j', async (query, expected) => {
    const { req, error } = await validateQuery(query);
    expect(error).toBeUndefined();
    expect(req.validated.query).toEqual(expected);
  });

  test('rejects invalid pagination and sort values', async () => {
    for (const query of [
      { page: '0' },
      { limit: '101' },
      { sortBy: 'userId' },
      { sortOrder: 'sideways' },
    ]) {
      const { error } = await validateQuery(query);
      expect(error.statusCode).toBe(400);
    }
  });
});
