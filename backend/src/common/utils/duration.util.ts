export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return `${days}d ${remainingHours}h`;
}

export function formatDurationMs(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  return formatDuration(Math.round(milliseconds / 1000));
}

export function calculateUptimePercentage(
  upCount: number,
  totalCount: number,
): number {
  if (totalCount === 0) return 100;
  return Math.round((upCount / totalCount) * 10000) / 100;
}

export function calculateAverageLatency(latencies: number[]): number | null {
  const validLatencies = latencies.filter((l) => l !== null && l !== undefined);
  if (validLatencies.length === 0) return null;

  const sum = validLatencies.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / validLatencies.length);
}
