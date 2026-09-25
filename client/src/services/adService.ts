import { api } from './api';
import { ApiResponse, Ad } from '../types';

export const adService = {
  /**
   * Fetch all currently active in-feed ads (public)
   */
  async getActiveAds(): Promise<ApiResponse<Ad[]>> {
    const res = await api.get<ApiResponse<Ad[]>>('/ads/active');
    return res.data;
  },

  /**
   * Track ad click (public, fire-and-forget)
   */
  async trackClick(adId: string): Promise<void> {
    try {
      await api.post(`/ads/${adId}/click`);
    } catch {
      // Quiet ignore to not interrupt user navigation
    }
  },

  /**
   * Track ad impression (public, fire-and-forget)
   */
  async trackImpression(adId: string): Promise<void> {
    try {
      await api.post(`/ads/${adId}/impression`);
    } catch {
      // Quiet ignore
    }
  },

  /**
   * Admin: Fetch all ads with performance metrics
   */
  async getAllAds(): Promise<ApiResponse<Ad[]>> {
    const res = await api.get<ApiResponse<Ad[]>>('/admin/ads');
    return res.data;
  },

  /**
   * Admin: Create new ad
   */
  async createAd(formData: FormData): Promise<ApiResponse<Ad>> {
    const res = await api.post<ApiResponse<Ad>>('/admin/ads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Admin: Update ad
   */
  async updateAd(id: string, formData: FormData): Promise<ApiResponse<Ad>> {
    const res = await api.patch<ApiResponse<Ad>>(`/admin/ads/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Admin: Delete ad
   */
  async deleteAd(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/admin/ads/${id}`);
    return res.data;
  },
};
