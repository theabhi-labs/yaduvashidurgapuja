import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await api.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post<ApiResponse<{ email: string }>>('/auth/forgot-password', { email });
    return res.data;
  },

  async verifyOtp(data: { email: string; otp: string }) {
    const res = await api.post<ApiResponse<{ resetToken: string }>>('/auth/verify-otp', data);
    return res.data;
  },

  async resetPassword(data: { resetToken: string; newPassword: string }) {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/reset-password', data);
    return res.data;
  },

  async verifyEmail(token: string) {
    const res = await api.post<ApiResponse<null>>('/auth/verify-email', { token });
    return res.data;
  },

  async resendVerification() {
    const res = await api.post<ApiResponse<{ verificationToken?: string }>>('/auth/resend-verification');
    return res.data;
  },
};
