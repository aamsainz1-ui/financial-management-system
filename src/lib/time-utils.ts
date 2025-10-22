// Time utility functions for consistent timestamp handling

export interface TimestampOptions {
  includeTime?: boolean;
  useRelative?: boolean;
  locale?: string;
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(
  timestamp: string | Date, 
  options: TimestampOptions = {}
): string {
  const {
    includeTime = true,
    useRelative = false,
    locale = 'th-TH'
  } = options;

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  if (useRelative) {
    return getRelativeTime(date, locale);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  return date.toLocaleString(locale, formatOptions);
}

/**
 * Get relative time (e.g., "2 นาทีที่แล้ว")
 */
export function getRelativeTime(date: Date, locale: string = 'th-TH'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'เมื่อสักครู่';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} สัปดาห์ที่แล้ว`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} เดือนที่แล้ว`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ปีที่แล้ว`;
}

/**
 * Add timestamps to data object
 */
export function addTimestamps<T extends Record<string, any>>(
  data: T,
  isUpdate: boolean = false
): T & { 
  createdAt?: string; 
  updatedAt: string;
  lastModified?: string;
} {
  const now = getCurrentTimestamp();
  
  if (isUpdate) {
    return {
      ...data,
      updatedAt: now,
      lastModified: now
    };
  }
  
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
    lastModified: now
  };
}

/**
 * Get time ago string for display
 */
export function getTimeAgo(timestamp: string | Date): string {
  return getRelativeTime(
    typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  );
}

/**
 * Check if timestamp is recent (within last 24 hours)
 */
export function isRecent(timestamp: string | Date): boolean {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

/**
 * Format duration between two timestamps
 */
export function formatDuration(
  start: string | Date,
  end: string | Date = new Date()
): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const diffInMs = endDate.getTime() - startDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} วินาที`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาที`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมง`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} วัน`;
}