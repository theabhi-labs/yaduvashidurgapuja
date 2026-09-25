export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  role: Role;
  isEmailVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type MemoryStatus = 'published' | 'hidden' | 'deleted';

export interface Memory {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  year: number;
  status: MemoryStatus;
  impressions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatComment {
  id?: string;
  name: string;
  message: string;
  timestamp: string;
}

export interface CommitteeMember {
  _id: string;
  name: string;
  photoUrl: string;
  designation: string;
  bio?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReportReason = 'inappropriate' | 'spam' | 'offensive' | 'misleading' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Report {
  _id: string;
  memoryId: Memory | { _id: string; caption: string; year: number; imageUrl: string };
  reporterId: {
    _id: string;
    name: string;
    email: string;
  };
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveSessionInfo {
  _id?: string;
  title: string;
  description?: string;
  roomName: string;
  hostName: string;
  startedAt: string;
  currentViewers?: number;
  peakViewers?: number;
  isChatEnabled?: boolean;
  isDonationEnabled?: boolean;
}

export interface ScheduledSession {
  _id: string;
  title: string;
  description?: string;
  roomName: string;
  hostName: string;
  scheduledAt: string;
  status: 'scheduled' | 'live' | 'ended';
  createdAt: string;
}

export interface GlobalSystemSettings {
  _id?: string;
  key: string;
  isDonationEnabled: boolean;
  isLiveChatEnabled: boolean;
  announcement?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface BroadcastHistoryItem {
  _id: string;
  title: string;
  description?: string;
  roomName: string;
  hostName: string;
  hostAdmin?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'live' | 'ended';
  startedAt: string;
  endedAt?: string;
  peakViewers: number;
}

export interface DailyBroadcastStat {
  _id: string; // Date YYYY-MM-DD
  dailyPeak: number;
  sessionCount: number;
}

export interface LiveSessionJoinResponse {
  roomName: string;
  title?: string;
  description?: string;
  token: string;
  wsUrl: string;
  hostName?: string;
  startedAt?: string;
  currentViewers?: number;
  peakViewers?: number;
  isChatEnabled?: boolean;
  isDonationEnabled?: boolean;
}

export interface LiveSessionStartResponse {
  sessionId: string;
  roomName: string;
  title?: string;
  token: string;
  wsUrl: string;
  isChatEnabled?: boolean;
  isDonationEnabled?: boolean;
}


export type DonationStatus = 'created' | 'paid' | 'failed';

export interface Donation {
  _id: string;
  donorName: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: DonationStatus;
  liveSessionRoomName?: string;
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  donorName: string;
  donationId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: any;
}

export interface DailyVisitorStat {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface PopularPageStat {
  path: string;
  title: string;
  views: number;
}

export interface VisitorAnalytics {
  liveActive: number;
  todayVisitors: number;
  totalVisitors: number;
  totalPageViews: number;
  dailyStats: DailyVisitorStat[];
  popularPages: PopularPageStat[];
}

export interface DashboardStats {
  users: {
    total: number;
    verified: number;
    suspended: number;
  };
  memories: {
    total: number;
    published: number;
    hidden: number;
  };
  reports: {
    pending: number;
    total: number;
  };
  committee: {
    total: number;
  };
  visitors?: VisitorAnalytics;
}

export interface Ad {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  sponsorName: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeroBanner {
  _id: string;
  title: string;
  badge?: string;
  subtext?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PujaSchedule {
  _id: string;
  title: string;
  time: string;
  description?: string;
  isSpecial: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


