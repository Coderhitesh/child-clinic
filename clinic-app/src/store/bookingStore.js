import { create } from 'zustand';

const emptyPatient = {
  name: '',
  dob: '',
  gender: '',
  contact: { phone: '', email: '' },
  guardianDetails: { name: '', relation: '', phone: '' },
};

const initial = {
  step: 1,
  speciality: null,
  clinic: null,
  doctor: null,
  date: '',
  slot: null,
  patient: null,
  newPatient: emptyPatient,
  symptoms: '',
  paymentMethod: 'pay_at_clinic',
  couponCode: '',
  couponResult: null,
  agreed: false,
  result: null,
};

export const useBookingStore = create((set, get) => ({
  ...initial,

  set: (patch) => set(patch),
  reset: () => set({ ...initial, newPatient: { ...emptyPatient } }),

  goto: (step) => set({ step: Math.min(5, Math.max(1, step)) }),
  next: () => set({ step: Math.min(5, get().step + 1) }),
  back: () => set({ step: Math.max(1, get().step - 1) }),

  pickSpeciality: (speciality) => set({ speciality, doctor: null, clinic: null, slot: null }),
  pickDoctor: (doctor) => set({ doctor, slot: null }),
  pickClinic: (clinic) => set({ clinic, slot: null }),
  pickDate: (date) => set({ date, slot: null }),
  pickSlot: (slot) => set({ slot }),

  fee: () => {
    const { doctor, clinic } = get();
    if (!doctor) return 0;
    const specialityId = doctor.speciality?._id || doctor.speciality;
    const override = clinic?.feeOverrides?.find(
      (f) => (f.speciality?._id || f.speciality) === specialityId
    );
    return override ? override.consultationFee : doctor.consultationFee || 0;
  },

  payable: () => Math.max(0, get().fee() - (get().couponResult?.discount || 0)),
}));
