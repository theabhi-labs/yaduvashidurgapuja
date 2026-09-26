import { api } from './api';
import { ApiResponse, Memory } from '../types';

const VIEWED_STORAGE_KEY = 'ydp_viewed_memories_v1';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown per unique user/device

const getViewedMemoriesMap = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(VIEWED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const cleanMap: Record<string, number> = {};
    for (const [key, timestamp] of Object.entries(parsed)) {
      if (typeof timestamp === 'number' && now - timestamp < COOLDOWN_MS) {
        cleanMap[key] = timestamp;
      }
    }
    return cleanMap;
  } catch {
    return {};
  }
};

const saveViewedMemory = (id: string) => {
  try {
    const map = getViewedMemoriesMap();
    map[id] = Date.now();
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
};

export const hasViewedMemoryRecently = (id: string): boolean => {
  if (!id) return true;
  const map = getViewedMemoriesMap();
  const lastViewed = map[id];
  if (lastViewed && Date.now() - lastViewed < COOLDOWN_MS) {
    return true;
  }
  return false;
};

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

  async recordImpression(id: string, visitorId?: string) {
    try {
      const res = await api.post<ApiResponse<{ impressions: number }>>(`/memories/${id}/impression`, {
        visitorId: visitorId || localStorage.getItem('ydp_visitor_token_v1') || undefined,
      });
      return res.data;
    } catch {
      return null;
    }
  },
};

export const trackMemoryView = async (
  id: string,
  onUpdated?: (newCount: number) => void
) => {
  if (!id || hasViewedMemoryRecently(id)) return;
  saveViewedMemory(id);

  try {
    const visitorId = localStorage.getItem('ydp_visitor_token_v1') || undefined;
    const res = await memoryService.recordImpression(id, visitorId);
    if (res && res.success && res.data && typeof res.data.impressions === 'number') {
      if (onUpdated) {
        onUpdated(res.data.impressions);
      }
    }
  } catch {
    // silently fail
  }
};
