const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const createToken = (userId) => jwt.sign({ sub: userId, jti: crypto.randomUUID() }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
});

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getTokenExpiration = (payload) => {
  if (typeof payload.exp !== 'number') return null;
  return new Date(payload.exp * 1000);
};

module.exports = { createToken, hashToken, getTokenExpiration };
