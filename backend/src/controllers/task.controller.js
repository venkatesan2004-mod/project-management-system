const taskService = require('../services/task.service');
const asyncHandler = require('../utils/async-handler');
const { sendSuccess } = require('../utils/api-response');

const listTasks = asyncHandler(async (req, res) => {
  const { tasks, meta } = await taskService.listTasks(req.user.id, req.validated.query);
  return sendSuccess(res, { message: 'Tasks retrieved successfully.', data: { tasks }, meta });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: 'Task created successfully.', data: { task } });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskOrThrow(req.validated.params.id, req.user.id);
  return sendSuccess(res, { message: 'Task retrieved successfully.', data: { task } });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.validated.params.id, req.user.id, req.validated.body);
  return sendSuccess(res, { message: 'Task updated successfully.', data: { task } });
});

const completeTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.validated.params.id, req.user.id, { status: 'COMPLETED' });
  return sendSuccess(res, { message: 'Task marked as completed.', data: { task } });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.validated.params.id, req.user.id);
  return sendSuccess(res, { message: 'Task deleted successfully.' });
});

module.exports = { listTasks, createTask, getTask, updateTask, completeTask, deleteTask };
