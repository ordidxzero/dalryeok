/**
 * DateTime에서 사용하는 시간 단위.
 */
export type DateTimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export const WEEK_STARTS_ON = {
  SUN: 0,
  MON: 1,
} as const;

export type WeekStartsOnType = (typeof WEEK_STARTS_ON)[keyof typeof WEEK_STARTS_ON];
