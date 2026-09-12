const authService = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');
const { sendSuccess } = require('../utils/api-response');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: 'Registration successful.', data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);
  return sendSuccess(res, { message: 'Login successful.', data: result });
});

const logout = asyncHandler(async (req, res) => {
  await authService.revokeToken({ userId: req.user.id, ...req.auth });
  return sendSuccess(res, { message: 'Logout successful.' });
});

module.exports = { register, login, logout };
