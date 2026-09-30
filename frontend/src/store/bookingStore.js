'use client';
import { create } from 'zustand';

const empty = {
  step: 1,
  speciality: null,
  clinic: null,
  doctor: null,
  date: null,
  slot: null,
  patient: null,        // { _id } for existing, or full object for a new record
  newPatient: {
    name: '', dob: '', gender: 'male', relation: '',
    contact: { phone: '', email: '' },
    guardianDetails: { name: '', relation: '', phone: '' },
  },
  symptoms: '',
  couponCode: '',
  couponResult: null,   // { discount, payableAmount, coupon }
  paymentMethod: 'pay_at_clinic',
  agreed: false,
  result: null,         // booking response
};

export const useBookingStore = create((set, get) => ({
  ...empty,
  set: (patch) => set(patch),
  goto: (step) => set({ step }),
  next: () => set({ step: Math.min(5, get().step + 1) }),
  back: () => set({ step: Math.max(1, get().step - 1) }),
  reset: () => set({ ...empty }),

  pickSpeciality: (speciality) =>
    set({ speciality, clinic: null, doctor: null, slot: null, date: null }),
  pickClinic: (clinic) => set({ clinic, doctor: null, slot: null }),
  // doctor already chosen, only the clinic they consult at changes
  switchClinic: (clinic) => set({ clinic, slot: null }),
  pickDoctor: (doctor) => set({ doctor, slot: null }),
  pickDate: (date) => set({ date, slot: null }),
  pickSlot: (slot) => set({ slot }),

  fee: () => {
    const d = get().doctor;
    return d?.consultationFee || 0;
  },
  payable: () => {
    const fee = get().doctor?.consultationFee || 0;
    const disc = get().couponResult?.discount || 0;
    return Math.max(0, fee - disc);
  },
}));
