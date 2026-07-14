import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import type { DashboardDevice } from '../../types/device';

const PIN_POSITIONS = [
  { top: '30%', left: '20%' },
  { top: '25%', left: '48%' },
  { top: '55%', left: '78%' },
  { top: '65%', left: '15%' },
  { top: '40%', left: '62%' },
  { top: '70%', left: '45%' },
];

export function WorldMap({ devices }: { devices: DashboardDevice[] }) {
  const pins = devices.slice(0, PIN_POSITIONS.length);

  return (
    <div className="relative h-[480px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant p-md">
        <h3 className="text-headline-md text-on-surface">Global Deployment Map</h3>
        <div className="flex gap-xs">
          <Badge tone="secondary">US-EAST</Badge>
          <Badge tone="error">EU-WEST</Badge>
        </div>
      </div>
      <div
        className="relative h-[calc(100%-73px)] opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #464555 1px, transparent 1px), linear-gradient(to bottom, #464555 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 top-[73px]">
        {pins.map((device, i) => {
          const healthy = device.lastStatus !== 'DOWN';
          return (
            <div
              key={device.id}
              className="absolute"
              style={PIN_POSITIONS[i % PIN_POSITIONS.length]}
            >
              <Tooltip content={`${device.name} — ${device.lastStatus ?? 'Unknown'}`}>
                <span
                  className={`block h-4 w-4 rounded-full ${
                    healthy ? 'bg-secondary animate-pulse-green' : 'bg-error animate-pulse-error'
                  }`}
                />
              </Tooltip>
            </div>
          );
        })}
        {pins.length === 0 && (
          <p className="flex h-full items-center justify-center text-body-sm text-on-surface-variant">
            No devices to display yet
          </p>
        )}
      </div>
    </div>
  );
}
