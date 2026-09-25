import { api } from './api';
import { ApiResponse, DashboardStats, User, Memory, Report } from '../types';

export const adminService = {
  async getStats() {
    const res = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
    return res.data;
  },

  async getLiveTraffic() {
    const res = await api.get<ApiResponse<{ liveActive: number; date: string; timestamp: string }>>('/analytics/live');
    return res.data;
  },

  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; isSuspended?: boolean }) {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data;
  },

  async toggleUserSuspension(id: string, data: { isSuspended: boolean; suspensionReason?: string }) {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}/suspend`, data);
    return res.data;
  },

  async updateUserRole(id: string, role: 'USER' | 'ADMIN') {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async getAdminMemories(params?: { page?: number; limit?: number; status?: string; year?: number; search?: string }) {
    const res = await api.get<ApiResponse<Memory[]>>('/admin/memories', { params });
    return res.data;
  },

  async updateMemoryStatus(id: string, status: string) {
    const res = await api.patch<ApiResponse<Memory>>(`/admin/memories/${id}/status`, { status });
    return res.data;
  },

  async getReports(params?: { page?: number; limit?: number; status?: string }) {
    const res = await api.get<ApiResponse<Report[]>>('/admin/reports', { params });
    return res.data;
  },

  async handleReport(id: string, data: { status: string; adminNotes?: string; action?: string }) {
    const res = await api.patch<ApiResponse<Report>>(`/admin/reports/${id}`, data);
    return res.data;
  },
};
