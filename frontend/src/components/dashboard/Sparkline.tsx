interface SparklineProps {
  data: (number | null)[];
  status: 'UP' | 'DOWN' | 'INACTIVE' | null;
  height?: number;
}

export function Sparkline({ data, status, height = 64 }: SparklineProps) {
  const values = data.map((v) => v ?? 0);
  const max = Math.max(...values, 1);
  const width = 200;
  const step = width / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const strokeClass =
    status === 'DOWN' ? 'stroke-error' : status === 'UP' ? 'stroke-secondary' : 'stroke-primary';

  if (values.every((v) => v === 0)) {
    return (
      <div
        className="flex items-center justify-center text-body-sm text-on-surface-variant"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        className={strokeClass}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
