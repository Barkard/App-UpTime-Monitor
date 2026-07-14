import { useRealtimeStore } from '../../stores/realtimeStore';
import { cn } from '../../utils/helpers';

function barColor(value: number): string {
  if (value < 25) return 'bg-pulse-low';
  if (value <= 75) return 'bg-pulse-mid';
  return 'bg-pulse-high';
}

export function PulseVisualization() {
  const pulseBars = useRealtimeStore((s) => s.pulseBars);
  const connected = useRealtimeStore((s) => s.connected);

  return (
    <div className="relative flex h-64 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
      <div className="mb-md flex items-center justify-between">
        <h3 className="text-headline-md text-on-surface">Network Pulse</h3>
        <span className="flex items-center gap-xs rounded-full bg-badge-muted px-sm py-1 text-label-caps text-secondary">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-secondary',
              connected && 'animate-pulse-green',
            )}
          />
          Live Status: {connected ? 'Operational' : 'Connecting...'}
        </span>
      </div>
      <div className="flex h-full flex-1 items-end gap-1">
        {pulseBars.map((value, i) => (
          <div
            key={i}
            className={cn('flex-1 rounded-t transition-all duration-700', barColor(value))}
            style={{ height: `${Math.max(value, 4)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
