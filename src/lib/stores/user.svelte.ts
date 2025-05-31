import { writable } from 'svelte/store';

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
}

interface UserState {
  preferences: UserPreferences;
}

const initialState: UserState = {
  preferences: {
    theme: 'light',
    notifications: true
  }
};

const { subscribe, set, update } = writable(initialState);

export const userStore = {
  subscribe,
  updatePreferences: (preferences: Partial<UserPreferences>) => {
    update(state => ({
      ...state,
      preferences: { ...state.preferences, ...preferences }
    }));
  },
  reset: () => set(initialState)
};