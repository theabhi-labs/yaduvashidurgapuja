import { api } from './api';
import { ApiResponse, Donation, DonationOrderResponse } from '../types';

export interface CreateDonationOrderPayload {
  amount: number;
  donorName?: string;
  isAnonymous?: boolean;
  liveSessionRoomName?: string;
  message?: string;
}

export interface VerifyDonationPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const donationService = {
  // Public: Create Razorpay donation order
  async createOrder(data: CreateDonationOrderPayload) {
    const res = await api.post<ApiResponse<DonationOrderResponse>>('/donations/create-order', data);
    return res.data;
  },

  // Public: Verify payment signature
  async verifyPayment(data: VerifyDonationPayload) {
    const res = await api.post<ApiResponse<Donation>>('/donations/verify', data);
    return res.data;
  },

  // Admin: Get donation logs & metrics
  async getDonations(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const res = await api.get<
      ApiResponse<{
        donations: Donation[];
        summary: { totalCollected: number; paidCount: number };
      }>
    >('/donations', { params });
    return res.data;
  },
};
