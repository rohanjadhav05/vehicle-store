import { atom } from 'recoil';

export const bookingAtom = atom({
  key: 'bookingAtom',
  default: {
    bookings: [],
    loading: false,
  },
});
