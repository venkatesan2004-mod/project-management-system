const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const AppError = require('../utils/app-error');
const { createToken } = require('../utils/jwt');

const publicUser = (user) => ({ id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt });

const register = async ({ fullName, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) throw new AppError('An account with this email already exists.', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { fullName, email, password: hashedPassword },
  });
  return publicUser(user);
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  return { user: publicUser(user), token: createToken(user.id) };
};

const revokeToken = async ({ userId, tokenHash, expiresAt }) => {
  await prisma.revokedToken.upsert({
    where: { tokenHash },
    update: {},
    create: { userId, tokenHash, expiresAt },
  });
};

module.exports = { register, login, revokeToken };
