const express = require('express');
const projectController = require('../controllers/project.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { idSchema } = require('../validators/common.validators');
const { createProjectSchema, updateProjectSchema, projectQuerySchema } = require('../validators/project.validators');

const router = express.Router();
router.use(authenticate);

router.route('/')
  .get(validate(projectQuerySchema, 'query'), projectController.listProjects)
  .post(validate(createProjectSchema, 'body'), projectController.createProject);
router.route('/:id')
  .get(validate(idSchema, 'params'), projectController.getProject)
  .put(validate(idSchema, 'params'), validate(updateProjectSchema, 'body'), projectController.updateProject)
  .delete(validate(idSchema, 'params'), projectController.deleteProject);

module.exports = router;
