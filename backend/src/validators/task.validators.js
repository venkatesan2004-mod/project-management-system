const { z } = require('zod');
const { optionalDate, paginationSchema } = require('./common.validators');

const taskPriorities = ['LOW', 'MEDIUM', 'HIGH'];
const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const taskFields = {
  name: z.string().trim().min(1, 'Task name is required.').max(150),
  description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
  priority: z.enum(taskPriorities).optional(),
  status: z.enum(taskStatuses).optional(),
  dueDate: optionalDate,
};

const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project id is required.'),
  ...taskFields,
  name: taskFields.name,
}).strict();

const updateTaskSchema = z.object(taskFields).partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field is required for an update.',
);

const taskQuerySchema = paginationSchema.extend({
  projectId: z.string().min(1).optional(),
  search: z.string().trim().max(150).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  sortBy: z.enum(['name', 'priority', 'status', 'dueDate', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).strict();

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };
