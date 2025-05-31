// ユーザー関連の型定義
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: "general" | "circle" | "admin";
  twitterId?: string;
  twitterUsername?: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  emailNotifications: boolean;
  adultContent: boolean;
  theme: "light" | "dark" | "auto";
}

// サークル関連の型定義
export interface Circle {
  id: string;
  circleName: string;
  circleKana?: string;
  genre: string[];
  placement: PlacementInfo;
  description?: string;
  contact: ContactInfo;
  tags: string[];
  isAdult: boolean;
  ownerId?: string;
  isPublic: boolean;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlacementInfo {
  day: "1" | "2";
  area: string;
  block: string;
  number: string;
  position: "a" | "b";
}

export interface ContactInfo {
  twitter?: string;
  pixiv?: string;
  website?: string;
  oshinaUrl?: string;
}

// ブックマーク関連の型定義
export interface Bookmark {
  id: string;
  userId: string;
  circleId: string;
  category: BookmarkCategory;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookmarkCategory = "check" | "interested" | "priority";

export interface BookmarkWithCircle extends Bookmark {
  circle: Circle;
}

// 検索・フィルター関連の型定義
export interface SearchFilters {
  query?: string;
  genres?: string[];
  days?: string[];
  areas?: string[];
  blocks?: string[];
  isAdult?: boolean;
  hasTwitter?: boolean;
  hasPixiv?: boolean;
  hasOshina?: boolean;
  tags?: string[];
}

export interface SearchParams extends SearchFilters {
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  sortOrder?: "asc" | "desc";
}

export type SortOption =
  | "placement"
  | "circleName"
  | "updatedAt"
  | "bookmarkCount";

export interface SearchResult {
  circles: Circle[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 編集権限関連の型定義
export interface EditPermissionRequest {
  id: string;
  userId: string;
  circleId: string;
  applicantTwitterId: string;
  registeredTwitterId?: string;
  status: PermissionStatus;
  isAutoApproved: boolean;
  evidenceUrls?: string[];
  adminNote?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export type PermissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto_approved";

export interface CirclePermission {
  id: string;
  userId: string;
  circleId: string;
  permission: "owner" | "editor";
  grantedAt: Date;
  grantedBy: string;
  isActive: boolean;
}

// イベント関連の型定義
export interface Event {
  id: string;
  name: string;
  eventDate: Date;
  venue: string;
  description?: string;
  isActive: boolean;
  mapImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API関連の型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

// マップ関連の型定義
export interface MapPin {
  id: string;
  circleId: string;
  x: number;
  y: number;
  category: BookmarkCategory;
  circle: Circle;
}

export interface MapViewport {
  x: number;
  y: number;
  zoom: number;
}

// フォーム関連の型定義
export interface CircleFormData {
  circleName: string;
  circleKana?: string;
  genre: string[];
  placement: PlacementInfo;
  description?: string;
  contact: ContactInfo;
  tags: string[];
  isAdult: boolean;
  isPublic: boolean;
}

export interface BookmarkFormData {
  category: BookmarkCategory;
  memo?: string;
}

// CSV エクスポート関連の型定義
export interface ExportOptions {
  categories?: BookmarkCategory[];
  includeFields: ExportField[];
  format: "csv" | "json";
}

export type ExportField =
  | "circleName"
  | "genre"
  | "placement"
  | "category"
  | "memo"
  | "twitter"
  | "pixiv"
  | "oshinaUrl"
  | "tags";

// 通知関連の型定義
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType =
  | "permission_approved"
  | "permission_rejected"
  | "circle_updated"
  | "system_announcement";

// エラー関連の型定義
export enum ErrorCodes {
  // 認証関連
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // バリデーション関連
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // リソース関連
  CIRCLE_NOT_FOUND = "CIRCLE_NOT_FOUND",
  BOOKMARK_NOT_FOUND = "BOOKMARK_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",

  // 権限関連
  PERMISSION_DENIED = "PERMISSION_DENIED",
  EDIT_PERMISSION_NOT_FOUND = "EDIT_PERMISSION_NOT_FOUND",

  // システム関連
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

// ユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
