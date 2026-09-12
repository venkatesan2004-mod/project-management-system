const prisma = require('../config/database');
const AppError = require('../utils/app-error');

const taskSelect = {
  id: true, name: true, description: true, priority: true, status: true, dueDate: true,
  createdAt: true, updatedAt: true, projectId: true,
  project: { select: { id: true, name: true } },
};

const getTaskOrThrow = async (id, userId) => {
  const task = await prisma.task.findFirst({
    where: { id, project: { userId } },
    select: taskSelect,
  });
  if (!task) throw new AppError('Task not found.', 404);
  return task;
};

const ensureOwnedProject = async (projectId, userId) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId }, select: { id: true } });
  if (!project) throw new AppError('Project not found.', 404);
};

const listTasks = async (userId, query) => {
  const { page, limit, projectId, search, status, priority, sortBy, sortOrder } = query;
  const where = {
    project: { userId },
    ...(projectId ? { projectId } : {}),
    ...(search ? { name: { contains: search } } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
  };
  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({ where, select: taskSelect, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * limit, take: limit }),
    prisma.task.count({ where }),
  ]);
  return { tasks, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const createTask = async (userId, data) => {
  const { projectId, ...taskData } = data;
  await ensureOwnedProject(projectId, userId);
  return prisma.task.create({ data: { ...taskData, projectId }, select: taskSelect });
};

const updateTask = async (id, userId, data) => {
  await getTaskOrThrow(id, userId);
  return prisma.task.update({ where: { id }, data, select: taskSelect });
};

const deleteTask = async (id, userId) => {
  await getTaskOrThrow(id, userId);
  await prisma.task.delete({ where: { id } });
};

module.exports = { listTasks, createTask, getTaskOrThrow, updateTask, deleteTask };
