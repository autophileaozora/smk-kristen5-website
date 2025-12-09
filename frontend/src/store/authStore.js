import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, token } = response.data.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Logout action
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Get current user
  getCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/api/auth/me');
      const user = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message });
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/api/auth/profile', data);
      const updatedUser = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));

      set({
        user: updatedUser,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      set({ loading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
