const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { idSchema } = require('../validators/common.validators');
const { createTaskSchema, updateTaskSchema, taskQuerySchema } = require('../validators/task.validators');

const router = express.Router();
router.use(authenticate);

router.route('/')
  .get(validate(taskQuerySchema, 'query'), taskController.listTasks)
  .post(validate(createTaskSchema, 'body'), taskController.createTask);
router.patch('/:id/complete', validate(idSchema, 'params'), taskController.completeTask);
router.route('/:id')
  .get(validate(idSchema, 'params'), taskController.getTask)
  .put(validate(idSchema, 'params'), validate(updateTaskSchema, 'body'), taskController.updateTask)
  .delete(validate(idSchema, 'params'), taskController.deleteTask);

module.exports = router;
