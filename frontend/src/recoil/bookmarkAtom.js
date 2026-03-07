import { atom } from 'recoil';

export const bookmarkAtom = atom({
  key: 'bookmarkAtom',
  default: {
    bookmarks: [],
    loading: false,
  },
});
