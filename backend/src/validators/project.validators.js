const { z } = require('zod');
const { optionalDate, paginationSchema } = require('./common.validators');

const projectStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

const projectFields = {
  name: z.string().trim().min(1, 'Project name is required.').max(150),
  description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
  status: z.enum(projectStatuses).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
};

const ensureDateRange = (data, context) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date must be on or after start date.' });
  }
};

const createProjectSchema = z.object({
  ...projectFields,
  name: projectFields.name,
}).strict().superRefine(ensureDateRange);

const updateProjectSchema = z.object(projectFields).partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field is required for an update.',
).superRefine(ensureDateRange);

const projectQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(150).optional(),
  status: z.enum(projectStatuses).optional(),
  sortBy: z.enum(['name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).strict();

module.exports = { createProjectSchema, updateProjectSchema, projectQuerySchema };
