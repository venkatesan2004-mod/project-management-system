const prisma = require('../config/database');
const AppError = require('../utils/app-error');

const projectSelect = {
  id: true, name: true, description: true, status: true, startDate: true, endDate: true,
  createdAt: true, updatedAt: true, userId: true, _count: { select: { tasks: true } },
};

const getProjectOrThrow = async (id, userId) => {
  const project = await prisma.project.findFirst({ where: { id, userId }, select: projectSelect });
  if (!project) throw new AppError('Project not found.', 404);
  return project;
};

const listProjects = async (userId, query) => {
  const { page, limit, search, status, sortBy, sortOrder } = query;
  const where = {
    userId,
    ...(search ? { name: { contains: search } } : {}),
    ...(status ? { status } : {}),
  };
  const pagination = {
    skip: (page - 1) * limit,
    take: limit,
  };
  const findManyArgs = {
    where,
    select: projectSelect,
    orderBy: { [sortBy]: sortOrder },
    ...pagination,
  };
  // Count must receive only the ownership/search/filter scope. Passing pagination
  // options to it would produce an incorrect total and can invalidate the query.
  const countArgs = { where: { ...where } };
  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany(findManyArgs),
    prisma.project.count(countArgs),
  ]);
  return { projects, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const createProject = (userId, data) => prisma.project.create({ data: { ...data, userId }, select: projectSelect });

const updateProject = async (id, userId, data) => {
  await getProjectOrThrow(id, userId);
  return prisma.project.update({ where: { id }, data, select: projectSelect });
};

const deleteProject = async (id, userId) => {
  await getProjectOrThrow(id, userId);
  await prisma.project.delete({ where: { id } });
};

module.exports = { listProjects, createProject, getProjectOrThrow, updateProject, deleteProject };
