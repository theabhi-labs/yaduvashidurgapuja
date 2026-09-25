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
  createdAt: string;
  updatedAt: string;
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

