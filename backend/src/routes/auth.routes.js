const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rate-limit.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validators');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema, 'body'), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema, 'body'), authController.login);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
