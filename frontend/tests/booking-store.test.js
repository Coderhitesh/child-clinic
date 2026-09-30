import { useBookingStore } from '@/store/bookingStore';

const initial = useBookingStore.getState();

beforeEach(() => {
  useBookingStore.setState(initial, true);
  useBookingStore.getState().reset();
});

describe('booking wizard store', () => {
  it('starts on step 1', () => {
    expect(useBookingStore.getState().step).toBe(1);
  });

  it('clamps navigation to the five steps', () => {
    const { next, back } = useBookingStore.getState();
    for (let i = 0; i < 8; i += 1) next();
    expect(useBookingStore.getState().step).toBe(5);
    for (let i = 0; i < 8; i += 1) back();
    expect(useBookingStore.getState().step).toBe(1);
  });

  it('picking a speciality clears the downstream choices', () => {
    const s = useBookingStore.getState();
    s.pickDoctor({ _id: 'd1', consultationFee: 800 });
    s.pickSlot({ _id: 'slot1' });
    s.pickSpeciality({ _id: 'sp2' });
    const after = useBookingStore.getState();
    expect(after.doctor).toBeNull();
    expect(after.slot).toBeNull();
    expect(after.clinic).toBeNull();
  });

  it('picking a date drops the previously chosen slot', () => {
    const s = useBookingStore.getState();
    s.pickSlot({ _id: 'slot1' });
    s.pickDate('2026-04-01');
    expect(useBookingStore.getState().slot).toBeNull();
  });

  it('payable subtracts the coupon discount and never goes negative', () => {
    const s = useBookingStore.getState();
    s.pickDoctor({ _id: 'd1', consultationFee: 800 });
    expect(useBookingStore.getState().payable()).toBe(800);

    s.set({ couponResult: { discount: 200 } });
    expect(useBookingStore.getState().payable()).toBe(600);

    s.set({ couponResult: { discount: 5000 } });
    expect(useBookingStore.getState().payable()).toBe(0);
  });

  it('reset clears the whole selection', () => {
    const s = useBookingStore.getState();
    s.pickDoctor({ _id: 'd1', consultationFee: 500 });
    s.set({ symptoms: 'fever', couponCode: 'SAVE20' });
    useBookingStore.getState().reset();
    const after = useBookingStore.getState();
    expect(after.doctor).toBeNull();
    expect(after.symptoms).toBe('');
    expect(after.couponCode).toBe('');
  });
});
