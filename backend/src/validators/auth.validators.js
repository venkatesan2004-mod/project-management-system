const { z } = require('zod');

const emailSchema = z.string().trim().toLowerCase().email('A valid email address is required.').max(191);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.').max(128);

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(100),
  email: emailSchema,
  password: passwordSchema,
}).strict();

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(128),
}).strict();

module.exports = { registerSchema, loginSchema };
