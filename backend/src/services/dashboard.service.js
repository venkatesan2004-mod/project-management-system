const prisma = require('../config/database');

const getDashboard = async (userId) => {
  const projectScope = { userId };
  const taskScope = { project: { userId } };
  const [totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress] = await prisma.$transaction([
    prisma.project.count({ where: projectScope }),
    prisma.task.count({ where: taskScope }),
    prisma.task.count({ where: { ...taskScope, status: 'COMPLETED' } }),
    prisma.task.count({ where: { ...taskScope, status: 'PENDING' } }),
    prisma.project.count({ where: { ...projectScope, status: 'IN_PROGRESS' } }),
  ]);
  return { totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress };
};

module.exports = { getDashboard };
