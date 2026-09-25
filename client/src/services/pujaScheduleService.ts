import { api } from './api';
import { ApiResponse, PujaSchedule } from '../types';

export const pujaScheduleService = {
  /**
   * Get active puja and aarti schedules (Public)
   */
  async getSchedules(): Promise<ApiResponse<PujaSchedule[]>> {
    const res = await api.get<ApiResponse<PujaSchedule[]>>('/puja-schedules');
    return res.data;
  },

  /**
   * Get all schedules for Admin
   */
  async getAllSchedules(): Promise<ApiResponse<PujaSchedule[]>> {
    const res = await api.get<ApiResponse<PujaSchedule[]>>('/puja-schedules/all');
    return res.data;
  },

  /**
   * Admin: Create new timing card
   */
  async createSchedule(data: {
    title: string;
    time: string;
    description?: string;
    isSpecial?: boolean;
    order?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<PujaSchedule>> {
    const res = await api.post<ApiResponse<PujaSchedule>>('/puja-schedules', data);
    return res.data;
  },

  /**
   * Admin: Update timing card
   */
  async updateSchedule(
    id: string,
    data: {
      title?: string;
      time?: string;
      description?: string;
      isSpecial?: boolean;
      order?: number;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<PujaSchedule>> {
    const res = await api.patch<ApiResponse<PujaSchedule>>(`/puja-schedules/${id}`, data);
    return res.data;
  },

  /**
   * Admin: Toggle schedule active status
   */
  async toggleActive(id: string): Promise<ApiResponse<PujaSchedule>> {
    const res = await api.patch<ApiResponse<PujaSchedule>>(`/puja-schedules/${id}/toggle`);
    return res.data;
  },

  /**
   * Admin: Delete timing card
   */
  async deleteSchedule(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/puja-schedules/${id}`);
    return res.data;
  },
};
