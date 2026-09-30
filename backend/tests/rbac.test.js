const { restrictTo } = require('../src/middleware/rbac');

const run = (middleware, user) => {
  const next = jest.fn();
  middleware({ user }, {}, next);
  return next.mock.calls[0][0]; // the error, or undefined when allowed
};

describe('restrictTo', () => {
  it('lets an allowed role through', () => {
    expect(run(restrictTo('superadmin', 'clinic_admin'), { role: 'clinic_admin' })).toBeUndefined();
  });

  it('blocks a role that is not listed', () => {
    const err = run(restrictTo('superadmin'), { role: 'receptionist' });
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(403);
  });

  it('blocks an unauthenticated request', () => {
    const err = run(restrictTo('patient'), undefined);
    expect(err.statusCode).toBe(403);
  });
});
