process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../src/config/database', () => ({
  user: { findUnique: jest.fn() },
  revokedToken: { findUnique: jest.fn(), upsert: jest.fn() },
}));

const jwt = require('jsonwebtoken');
const prisma = require('../src/config/database');
const { authenticate } = require('../src/middleware/auth.middleware');
const { createToken, hashToken } = require('../src/utils/jwt');
const { revokeToken } = require('../src/services/auth.service');

const runAuthentication = (token) => new Promise((resolve) => {
  const req = { headers: { authorization: `Bearer ${token}` } };
  authenticate(req, {}, (error) => resolve({ req, error }));
});

describe('JWT revocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('issues a JWT with a unique identifier', () => {
    const token = createToken('user-1');
    const payload = jwt.decode(token);
    expect(payload).toMatchObject({ sub: 'user-1' });
    expect(payload.jti).toEqual(expect.any(String));
    expect(payload.exp).toEqual(expect.any(Number));
  });

  test('stores only a token hash when logging out', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    prisma.revokedToken.upsert.mockResolvedValue({ id: 'revocation-1' });

    await revokeToken({ userId: 'user-1', tokenHash: hashToken('signed.jwt.value'), expiresAt });

    expect(prisma.revokedToken.upsert).toHaveBeenCalledWith({
      where: { tokenHash: hashToken('signed.jwt.value') },
      update: {},
      create: { userId: 'user-1', tokenHash: hashToken('signed.jwt.value'), expiresAt },
    });
    expect(JSON.stringify(prisma.revokedToken.upsert.mock.calls)).not.toContain('signed.jwt.value');
  });

  test('rejects a validly signed token when its hash has been revoked', async () => {
    const token = createToken('user-1');
    prisma.revokedToken.findUnique.mockResolvedValue({ id: 'revocation-1' });

    const { error } = await runAuthentication(token);

    expect(prisma.revokedToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(token) },
      select: { id: true },
    });
    expect(error).toMatchObject({ statusCode: 401, message: 'Authentication token has been revoked.' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
