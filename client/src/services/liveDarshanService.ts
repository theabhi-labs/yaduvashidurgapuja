import { api } from './api';
import {
  ApiResponse,
  LiveSessionInfo,
  LiveSessionJoinResponse,
  LiveSessionStartResponse,
  ChatComment,
  ScheduledSession,
  GlobalSystemSettings,
  BroadcastHistoryItem,
  DailyBroadcastStat,
} from '../types';

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

  // Public: Get ephemeral recent comments from Redis
  async getRoomComments(roomName: string) {
    const res = await api.get<ApiResponse<ChatComment[]>>(`/live-darshan/${roomName}/comments`);
    return res.data;
  },

  // Public: Get upcoming scheduled aarti programs
  async listScheduledSessions() {
    const res = await api.get<ApiResponse<ScheduledSession[]>>('/live-darshan/schedules');
    return res.data;
  },

  // Public/Admin: Get global system settings
  async getGlobalSettings() {
    const res = await api.get<ApiResponse<GlobalSystemSettings>>('/live-darshan/global-settings');
    return res.data;
  },

  // Admin: Schedule a future live broadcast
  async scheduleSession(data: { title: string; description?: string; scheduledAt: string }) {
    const res = await api.post<ApiResponse<ScheduledSession>>('/live-darshan/schedule', data);
    return res.data;
  },

  // Admin: Delete a scheduled broadcast
  async deleteScheduledSession(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/live-darshan/schedule/${id}`);
    return res.data;
  },

  // Admin: Start live broadcast (with topic/title and settings)
  async startSession(data?: {
    title?: string;
    description?: string;
    scheduledId?: string;
    isChatEnabled?: boolean;
    isDonationEnabled?: boolean;
  }) {
    const res = await api.post<ApiResponse<LiveSessionStartResponse>>('/live-darshan/start', data || {});
    return res.data;
  },

  // Admin: End live broadcast
  async endSession(roomName: string) {
    const res = await api.post<ApiResponse<{ sessionId: string; roomName: string; peakViewers?: number }>>(
      `/live-darshan/${roomName}/end`
    );
    return res.data;
  },

  // Admin: Toggle live chat on/off for a stream
  async toggleChat(roomName: string, isChatEnabled: boolean) {
    const res = await api.patch<ApiResponse<{ isChatEnabled: boolean }>>(
      `/live-darshan/${roomName}/toggle-chat`,
      { isChatEnabled }
    );
    return res.data;
  },

  // Admin: Toggle donation on/off for a stream
  async toggleDonation(roomName: string, isDonationEnabled: boolean) {
    const res = await api.patch<ApiResponse<{ isDonationEnabled: boolean }>>(
      `/live-darshan/${roomName}/toggle-donation`,
      { isDonationEnabled }
    );
    return res.data;
  },

  // Super Admin: Update global donation / chat settings
  async updateGlobalSettings(data: {
    isDonationEnabled?: boolean;
    isLiveChatEnabled?: boolean;
    announcement?: string;
  }) {
    const res = await api.patch<ApiResponse<GlobalSystemSettings>>('/live-darshan/global-settings', data);
    return res.data;
  },

  // Admin / Super Admin: End ALL active live broadcasts
  async endAllLiveSessions() {
    const res = await api.post<ApiResponse<null>>('/live-darshan/end-all-live');
    return res.data;
  },

  // Admin / Audit: Get per-broadcast transcript and donation log
  async getSessionLogs(roomName: string) {
    const res = await api.get<ApiResponse<import('../types').SessionLogsResponse>>(
      `/live-darshan/session/${roomName}/logs`
    );
    return res.data;
  },

  // Admin: Get broadcast analytics history and peak viewers
  async getBroadcastHistory(params?: { page?: number; limit?: number }) {
    const res = await api.get<
      ApiResponse<{
        history: BroadcastHistoryItem[];
        dailyStats: DailyBroadcastStat[];
      }>
    >('/live-darshan/history', { params });
    return res.data;
  },
};
