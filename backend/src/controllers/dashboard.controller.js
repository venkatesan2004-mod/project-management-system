const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/async-handler');
const { sendSuccess } = require('../utils/api-response');

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.user.id);
  return sendSuccess(res, { message: 'Dashboard retrieved successfully.', data: dashboard });
});

module.exports = { getDashboard };
