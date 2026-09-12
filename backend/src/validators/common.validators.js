const { z } = require('zod');

const idSchema = z.object({
  id: z.string().min(1, 'A resource id is required.'),
}).strict();

const optionalDate = z.preprocess(
  (value) => (value === '' ? null : value),
  z.coerce.date({ invalid_type_error: 'A valid date is required.' }).nullable().optional(),
);

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).strict();

module.exports = { idSchema, optionalDate, paginationSchema };
