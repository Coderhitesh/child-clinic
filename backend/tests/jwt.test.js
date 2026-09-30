const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../src/utils/jwt');

describe('jwt helpers', () => {
  it('round-trips a refresh token', () => {
    const token = signRefreshToken({ id: 'u1', role: 'patient', v: 2 });
    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe('u1');
    expect(decoded.v).toBe(2);
  });

  it('rejects a tampered refresh token', () => {
    const token = signRefreshToken({ id: 'u1', role: 'patient', v: 0 });
    expect(() => verifyRefreshToken(`${token}x`)).toThrow();
  });

  it('refuses to verify an access token as a refresh token', () => {
    const access = signAccessToken({ id: 'u1', role: 'patient' });
    expect(() => verifyRefreshToken(access)).toThrow();
  });
});
