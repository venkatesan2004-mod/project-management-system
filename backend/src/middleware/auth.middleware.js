const jwt = require('jsonwebtoken');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const prisma = require('../config/database');
const { hashToken, getTokenExpiration } = require('../utils/jwt');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AppError('Authentication is required.', 401);
  }

  const token = authorization.slice(7).trim();
  if (!token) throw new AppError('Authentication is required.', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new AppError('Token has expired.', 401);
    throw new AppError('Invalid authentication token.', 401);
  }

  if (!payload || typeof payload === 'string' || typeof payload.sub !== 'string' || !getTokenExpiration(payload)) {
    throw new AppError('Invalid authentication token.', 401);
  }

  const tokenHash = hashToken(token);
  const revokedToken = await prisma.revokedToken.findUnique({
    where: { tokenHash },
    select: { id: true },
  });
  if (revokedToken) throw new AppError('Authentication token has been revoked.', 401);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, fullName: true, email: true },
  });
  if (!user) throw new AppError('Authentication is required.', 401);

  req.user = user;
  req.auth = { tokenHash, expiresAt: getTokenExpiration(payload) };
  next();
});

module.exports = { authenticate };
