import { api } from './api';
import { ApiResponse, Report } from '../types';

export const reportService = {
  async createReport(data: { memoryId: string; reason: string; description?: string }) {
    const res = await api.post<ApiResponse<Report>>('/reports', data);
    return res.data;
  },

  async getMyReports() {
    const res = await api.get<ApiResponse<Report[]>>('/reports/my');
    return res.data;
  },
};
