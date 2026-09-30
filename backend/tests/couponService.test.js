// computeDiscount is exercised against stubbed models — the maths and the guard
// rails are what matter here, not Mongo.
jest.mock('../src/models/Coupon', () => ({ findOne: jest.fn(), findByIdAndUpdate: jest.fn() }));
jest.mock('../src/models/CouponUsage', () => ({ countDocuments: jest.fn(), create: jest.fn() }));

const Coupon = require('../src/models/Coupon');
const CouponUsage = require('../src/models/CouponUsage');
const { computeDiscount } = require('../src/services/couponService');

const baseCoupon = (over = {}) => ({
  _id: 'c1',
  code: 'SAVE20',
  discountType: 'percentage',
  discountValue: 20,
  maxDiscountAmount: null,
  minAppointmentAmount: 0,
  applicableClinics: [],
  applicableSpecialities: [],
  usageLimitTotal: null,
  usageLimitPerUser: 1,
  usedCount: 0,
  validFrom: new Date(Date.now() - 86400000),
  validTo: new Date(Date.now() + 86400000),
  isActive: true,
  ...over,
});

const args = { code: 'save20', userId: 'u1', amount: 1000, clinicId: 'cl1', specialityId: 'sp1' };

beforeEach(() => {
  jest.clearAllMocks();
  CouponUsage.countDocuments.mockResolvedValue(0);
});

describe('computeDiscount', () => {
  it('applies a percentage discount', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon());
    const { discount } = await computeDiscount(args);
    expect(discount).toBe(200);
  });

  it('caps a percentage discount at maxDiscountAmount', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon({ maxDiscountAmount: 150 }));
    const { discount } = await computeDiscount(args);
    expect(discount).toBe(150);
  });

  it('never discounts more than the bill itself', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon({ discountType: 'flat', discountValue: 5000 }));
    const { discount } = await computeDiscount(args);
    expect(discount).toBe(1000);
  });

  it('rejects an unknown code', async () => {
    Coupon.findOne.mockResolvedValue(null);
    await expect(computeDiscount(args)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('rejects an expired coupon', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon({ validTo: new Date(Date.now() - 1000) }));
    await expect(computeDiscount(args)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a bill below the minimum', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon({ minAppointmentAmount: 2000 }));
    await expect(computeDiscount(args)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a coupon scoped to another clinic', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon({ applicableClinics: ['other'] }));
    await expect(computeDiscount(args)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects once the per-user limit is spent', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon());
    CouponUsage.countDocuments.mockResolvedValue(1);
    await expect(computeDiscount(args)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects once the global limit is reached', async () => {
    Coupon.findOne.mockResolvedValue(baseCoupon({ usageLimitTotal: 5, usedCount: 5 }));
    await expect(computeDiscount(args)).rejects.toMatchObject({ statusCode: 400 });
  });
});
