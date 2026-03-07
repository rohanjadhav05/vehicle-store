import { atom } from 'recoil';

export const filterAtom = atom({
  key: 'filterAtom',
  default: {
    brandId: null,
    fuelTypeId: null,
    minPrice: '',
    maxPrice: '',
  },
});
