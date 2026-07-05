/**
 * Format dates as relative human timestamps (5m ago, 2h ago, 3d ago).
 *
 * Why: Chat UIs and conversation lists need compact, locale-aware relative times.
 * This avoids bloated date libraries and works in all browsers/Node.
 *
 * Usage:
 *   formatRelative(new Date(Date.now() - 5*60*1000));  // "5m ago"
 *   formatClock(new Date());                            // "14:32:15"
 */

export function formatRelative(date: Date | number): string {
  const then = typeof date === "number" ? date : date.getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatClock(
  date: Date | number,
  locale: string = "en-GB",
): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDate(
  date: Date | number,
  locale: string = "en-US",
): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDatetime(
  date: Date | number,
  locale: string = "en-US",
): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const dateStr = formatDate(d, locale);
  const timeStr = formatClock(d, locale);
  return `${dateStr} ${timeStr}`;
}
