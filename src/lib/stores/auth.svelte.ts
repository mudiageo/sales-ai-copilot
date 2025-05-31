import { writable } from 'svelte/store';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true
};

const { subscribe, set, update } = writable(initialState);

export const auth = {
  subscribe,
  signIn: async (email: string, password: string) => {
    // Implement sign in logic
  },
  signOut: async () => {
    set(initialState);
  },
  setUser: (user: User) => {
    update(state => ({ ...state, user, isAuthenticated: true, loading: false }));
  }
};