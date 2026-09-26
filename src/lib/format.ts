const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const longDate = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
const weekdayTime = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const month = new Intl.DateTimeFormat(undefined, { month: 'short' });
const day = new Intl.DateTimeFormat(undefined, { day: 'numeric' });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

/** e.g. "Friday, October 7, 2026" */
export function formatLongDate(iso: string): string {
  return longDate.format(new Date(iso));
}

/** e.g. "Fri 7:30 PM" */
export function formatWeekdayTime(iso: string): string {
  return weekdayTime.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return time.format(new Date(iso));
}

export function formatMonth(iso: string): string {
  return month.format(new Date(iso));
}

export function formatDay(iso: string): string {
  return day.format(new Date(iso));
}

/** Formats a remaining duration as m:ss, or h:mm:ss past an hour. Never negative. */
export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`;
}
