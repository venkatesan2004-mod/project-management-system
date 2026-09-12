jest.mock('../src/config/database', () => ({
  project: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}));

const prisma = require('../src/config/database');
const { listProjects } = require('../src/services/project.service');

describe('listProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.project.findMany.mockReturnValue({ query: 'findMany' });
    prisma.project.count.mockReturnValue({ query: 'count' });
    prisma.$transaction.mockResolvedValue([[{ id: 'project-1', name: 'Alpha' }], 3]);
  });

  test('passes pagination only to findMany and retains the scoped count query', async () => {
    const result = await listProjects('user-1', {
      page: 2,
      limit: 5,
      search: 'Alpha',
      status: 'IN_PROGRESS',
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user-1', name: { contains: 'Alpha' }, status: 'IN_PROGRESS' },
      orderBy: { name: 'asc' },
      skip: 5,
      take: 5,
    }));
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', name: { contains: 'Alpha' }, status: 'IN_PROGRESS' },
    });
    expect(prisma.project.count.mock.calls[0][0]).not.toHaveProperty('skip');
    expect(prisma.project.count.mock.calls[0][0]).not.toHaveProperty('take');
    expect(result.meta).toEqual({ page: 2, limit: 5, total: 3, totalPages: 1 });
  });
});
