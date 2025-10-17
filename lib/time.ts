export const parseDuration = (durationStr: string): number | null => {
  if (!durationStr) return null;
  const match = durationStr.trim().match(/^(\d+(\.\d+)?)\s*(s|m|h|d)$/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[3].toLowerCase();

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
};

export const millisecondsToFriendlyString = (ms: number): string => {
  if (ms < 0) return "0s";
  const days = ms / 86400000;
  if (days >= 1) return `${Number(days.toPrecision(3))}d`;
  const hours = ms / 3600000;
  if (hours >= 1) return `${Number(hours.toPrecision(3))}h`;
  const minutes = ms / 60000;
  if (minutes >= 1) return `${Number(minutes.toPrecision(3))}m`;
  const seconds = ms / 1000;
  return `${Number(seconds.toPrecision(3))}s`;
};
