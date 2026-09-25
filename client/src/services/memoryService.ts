import { api } from './api';
import { ApiResponse, Memory } from '../types';

export const memoryService = {
  async getMemories(params?: { page?: number; limit?: number; year?: number; search?: string }) {
    const res = await api.get<ApiResponse<Memory[]>>('/memories', { params });
    return res.data;
  },

  async getMemoryById(id: string) {
    const res = await api.get<ApiResponse<Memory>>(`/memories/${id}`);
    return res.data;
  },

  async createMemory(formData: FormData) {
    const res = await api.post<ApiResponse<Memory>>('/memories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getMyMemories() {
    const res = await api.get<ApiResponse<Memory[]>>('/memories/my');
    return res.data;
  },

  async updateMemory(id: string, data: { caption?: string; year?: number; status?: string }) {
    const res = await api.patch<ApiResponse<Memory>>(`/memories/${id}`, data);
    return res.data;
  },

  async deleteMemory(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/memories/${id}`);
    return res.data;
  },

  async recordImpression(id: string) {
    try {
      const res = await api.post<ApiResponse<{ impressions: number }>>(`/memories/${id}/impression`);
      return res.data;
    } catch {
      return null;
    }
  },
};

