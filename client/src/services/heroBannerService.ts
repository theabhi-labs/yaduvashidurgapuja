import { api } from './api';
import { ApiResponse, HeroBanner } from '../types';

export const heroBannerService = {
  /**
   * Fetch all currently active hero banners for public homepage carousel
   */
  async getActiveBanners(): Promise<ApiResponse<HeroBanner[]>> {
    const res = await api.get<ApiResponse<HeroBanner[]>>('/hero-banners/active');
    return res.data;
  },

  /**
   * Admin: Fetch all hero banners for management
   */
  async getAllBanners(): Promise<ApiResponse<HeroBanner[]>> {
    const res = await api.get<ApiResponse<HeroBanner[]>>('/hero-banners');
    return res.data;
  },

  /**
   * Admin: Create new hero banner with photo upload
   */
  async createBanner(formData: FormData): Promise<ApiResponse<HeroBanner>> {
    const res = await api.post<ApiResponse<HeroBanner>>('/hero-banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Admin: Update hero banner
   */
  async updateBanner(id: string, formData: FormData): Promise<ApiResponse<HeroBanner>> {
    const res = await api.patch<ApiResponse<HeroBanner>>(`/hero-banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Admin: Toggle banner active state
   */
  async toggleActive(id: string): Promise<ApiResponse<HeroBanner>> {
    const res = await api.patch<ApiResponse<HeroBanner>>(`/hero-banners/${id}/toggle`);
    return res.data;
  },

  /**
   * Admin: Delete hero banner
   */
  async deleteBanner(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/hero-banners/${id}`);
    return res.data;
  },
};
