import { api } from './api';
import { ApiResponse, CommitteeMember } from '../types';

export const committeeService = {
  async getCommittee() {
    const res = await api.get<ApiResponse<CommitteeMember[]>>('/committee');
    return res.data;
  },

  async getAllMembersAdmin() {
    const res = await api.get<ApiResponse<CommitteeMember[]>>('/committee/all');
    return res.data;
  },

  async createMember(formData: FormData) {
    const res = await api.post<ApiResponse<CommitteeMember>>('/committee', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateMember(id: string, formData: FormData) {
    const res = await api.patch<ApiResponse<CommitteeMember>>(`/committee/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteMember(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/committee/${id}`);
    return res.data;
  },

  async reorderMembers(orders: { id: string; displayOrder: number }[]) {
    const res = await api.patch<ApiResponse<null>>('/committee/reorder', { orders });
    return res.data;
  },
};
