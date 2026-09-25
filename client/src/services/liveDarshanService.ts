import { api } from './api';
import { ApiResponse, LiveSessionInfo, LiveSessionJoinResponse, LiveSessionStartResponse } from '../types';

export const liveDarshanService = {
  // Public: List all active live sessions
  async listLiveSessions() {
    const res = await api.get<ApiResponse<LiveSessionInfo[]>>('/live-darshan');
    return res.data;
  },

  // Public/Guest: Join active live session and get viewer token
  async joinSession(roomName: string) {
    const res = await api.get<ApiResponse<LiveSessionJoinResponse>>(`/live-darshan/${roomName}/join`);
    return res.data;
  },

  // Admin: Start live broadcast
  async startSession() {
    const res = await api.post<ApiResponse<LiveSessionStartResponse>>('/live-darshan/start');
    return res.data;
  },

  // Admin: End live broadcast
  async endSession(roomName: string) {
    const res = await api.post<ApiResponse<{ sessionId: string; roomName: string }>>(`/live-darshan/${roomName}/end`);
    return res.data;
  },
};
