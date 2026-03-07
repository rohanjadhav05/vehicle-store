import { atom } from 'recoil';

export const vehicleAtom = atom({
  key: 'vehicleAtom',
  default: {
    vehicles: [],
    loading: false,
    totalCount: 0,
  },
});
