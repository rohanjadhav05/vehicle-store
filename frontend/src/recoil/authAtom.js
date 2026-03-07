import { atom } from 'recoil';

const getInitialState = () => {
  const saved = localStorage.getItem('authState');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse auth state:', e);
    }
  }
  return {
    userId: null,
    username: null,
    userType: null, // 'A' or 'U'
    isLoggedIn: false,
    token: null,
  };
};

export const authAtom = atom({
  key: 'authAtom',
  default: getInitialState(),
  effects: [
    ({ onSet }) => {
      onSet((newAuth) => {
        if (newAuth.isLoggedIn) {
          localStorage.setItem('authState', JSON.stringify(newAuth));
        } else {
          localStorage.removeItem('authState');
        }
      });
    },
  ],
});
