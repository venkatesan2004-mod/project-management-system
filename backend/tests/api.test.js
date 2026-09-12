const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const { hashToken } = require('../src/utils/jwt');

const testSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const emailFor = (name) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${testSuffix}@example.test`;

const registerAndLogin = async (name) => {
  const email = emailFor(name);
  const password = 'SecurePassword123!';
  const registration = await request(app).post('/api/auth/register').send({ fullName: name, email, password });
  expect(registration.status).toBe(201);
  const login = await request(app).post('/api/auth/login').send({ email, password });
  expect(login.status).toBe(200);
  return { email, password, user: login.body.data.user, token: login.body.data.token };
};

describe('Project Management API integration tests', () => {
  afterAll(async () => {
    await prisma.revokedToken.deleteMany({ where: { user: { email: { contains: testSuffix } } } });
    await prisma.task.deleteMany({ where: { project: { user: { email: { contains: testSuffix } } } } });
    await prisma.project.deleteMany({ where: { user: { email: { contains: testSuffix } } } });
    await prisma.user.deleteMany({ where: { email: { contains: testSuffix } } });
    await prisma.$disconnect();
  });

  test('registers a user, rejects duplicate and invalid registration, and logs in securely', async () => {
    const email = emailFor('auth');
    const payload = { fullName: 'Auth User', email, password: 'SecurePassword123!' };
    const registration = await request(app).post('/api/auth/register').send(payload);
    expect(registration.status).toBe(201);
    expect(registration.body.data.user.password).toBeUndefined();

    const duplicate = await request(app).post('/api/auth/register').send(payload);
    expect(duplicate.status).toBe(409);

    const invalid = await request(app).post('/api/auth/register').send({ fullName: '', email: 'bad-email', password: 'short' });
    expect(invalid.status).toBe(400);

    const login = await request(app).post('/api/auth/login').send({ email, password: payload.password });
    expect(login.status).toBe(200);
    expect(login.body.data.token).toEqual(expect.any(String));

    const invalidLogin = await request(app).post('/api/auth/login').send({ email, password: 'WrongPassword123!' });
    expect(invalidLogin.status).toBe(401);
  });

  test('revokes a logged-out token while allowing a subsequently issued token', async () => {
    const user = await registerAndLogin('Logout User');
    const authorization = `Bearer ${user.token}`;

    expect((await request(app).get('/api/projects').set('Authorization', authorization)).status).toBe(200);
    const logout = await request(app).post('/api/auth/logout').set('Authorization', authorization);
    expect(logout.status).toBe(200);
    expect(logout.body).toMatchObject({ success: true, message: 'Logout successful.' });

    const revocation = await prisma.revokedToken.findUnique({ where: { tokenHash: hashToken(user.token) } });
    expect(revocation).toBeTruthy();
    expect(JSON.stringify(revocation)).not.toContain(user.token);
    expect((await request(app).get('/api/projects').set('Authorization', authorization)).status).toBe(401);

    const freshLogin = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(freshLogin.status).toBe(200);
    expect((await request(app).get('/api/projects').set('Authorization', `Bearer ${freshLogin.body.data.token}`)).status).toBe(200);
  });

  test('allows a user to create, retrieve, update, and delete only their own project', async () => {
    const owner = await registerAndLogin('Project Owner');
    const other = await registerAndLogin('Other Project User');
    const create = await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Owner Project', status: 'NOT_STARTED' });
    expect(create.status).toBe(201);
    const projectId = create.body.data.project.id;

    expect((await request(app).get(`/api/projects/${projectId}`).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
    expect((await request(app).put(`/api/projects/${projectId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'IN_PROGRESS' })).status).toBe(200);
    expect((await request(app).get(`/api/projects/${projectId}`).set('Authorization', `Bearer ${other.token}`)).status).toBe(404);
    expect((await request(app).put(`/api/projects/${projectId}`).set('Authorization', `Bearer ${other.token}`).send({ name: 'Hijacked' })).status).toBe(404);
    expect((await request(app).delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${other.token}`)).status).toBe(404);
    expect((await request(app).delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
  });

  test('lists only owned projects and applies pagination without changing the total', async () => {
    const owner = await registerAndLogin('Project List Owner');
    const other = await registerAndLogin('Project List Other');
    await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Alpha Project', status: 'IN_PROGRESS' });
    await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Beta Project', status: 'NOT_STARTED' });
    await request(app).post('/api/projects').set('Authorization', `Bearer ${other.token}`).send({ name: 'Other User Project' });

    const response = await request(app).get('/api/projects?search=Project&page=1&limit=1&sortBy=name&sortOrder=asc')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.projects).toHaveLength(1);
    expect(response.body.data.projects[0].name).toBe('Alpha Project');
    expect(response.body.meta).toMatchObject({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });

  test('authorizes task access through the owning project and prevents project reassignment', async () => {
    const owner = await registerAndLogin('Task Owner');
    const other = await registerAndLogin('Other Task User');
    const ownerProject = await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Owner Task Project' });
    const otherProject = await request(app).post('/api/projects').set('Authorization', `Bearer ${other.token}`).send({ name: 'Other Task Project' });
    expect((await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Unauthorized Project Task', projectId: otherProject.body.data.project.id })).status).toBe(404);
    const task = await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Owner Task', projectId: ownerProject.body.data.project.id, priority: 'HIGH' });
    expect(task.status).toBe(201);
    const taskId = task.body.data.task.id;

    expect((await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
    expect((await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'IN_PROGRESS' })).status).toBe(200);
    expect((await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${owner.token}`).send({ projectId: otherProject.body.data.project.id })).status).toBe(400);
    expect((await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${other.token}`)).status).toBe(404);
    expect((await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${other.token}`).send({ name: 'Hijacked' })).status).toBe(404);
    expect((await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${other.token}`)).status).toBe(404);
    expect((await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
  });

  test('returns dashboard counts scoped to the authenticated user', async () => {
    const owner = await registerAndLogin('Dashboard Owner');
    const other = await registerAndLogin('Dashboard Other');
    const ownerProject = await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'In Progress', status: 'IN_PROGRESS' });
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Done', projectId: ownerProject.body.data.project.id, status: 'COMPLETED' });
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Pending', projectId: ownerProject.body.data.project.id, status: 'PENDING' });
    await request(app).post('/api/projects').set('Authorization', `Bearer ${other.token}`).send({ name: 'Other Project', status: 'IN_PROGRESS' });

    const dashboard = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${owner.token}`);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data).toMatchObject({ totalProjects: 1, totalTasks: 2, completedTasks: 1, pendingTasks: 1, projectsInProgress: 1 });
  });
});
