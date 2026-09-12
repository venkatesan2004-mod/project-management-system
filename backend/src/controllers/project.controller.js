const projectService = require('../services/project.service');
const asyncHandler = require('../utils/async-handler');
const { sendSuccess } = require('../utils/api-response');

const listProjects = asyncHandler(async (req, res) => {
  const { projects, meta } = await projectService.listProjects(req.user.id, req.validated.query);
  return sendSuccess(res, { message: 'Projects retrieved successfully.', data: { projects }, meta });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: 'Project created successfully.', data: { project } });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectOrThrow(req.validated.params.id, req.user.id);
  return sendSuccess(res, { message: 'Project retrieved successfully.', data: { project } });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.validated.params.id, req.user.id, req.validated.body);
  return sendSuccess(res, { message: 'Project updated successfully.', data: { project } });
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.validated.params.id, req.user.id);
  return sendSuccess(res, { message: 'Project deleted successfully.' });
});

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
