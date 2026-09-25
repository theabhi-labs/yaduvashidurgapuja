import { api } from './api';
import { ApiResponse } from '../types';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  async submitMessage(data: ContactFormData) {
    const res = await api.post<ApiResponse<{ received: boolean; timestamp: string }>>(
      '/contact',
      data
    );
    return res.data;
  },
};
