import { Link } from 'react-router-dom';
import { MaterialIcon } from '../icons/MaterialIcon';
import { formatDuration, formatRelativeTime } from '../../utils/formatters';
import type { Incident } from '../../types/log';

export function IncidentLogWidget({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="flex max-h-[480px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant p-md">
        <h3 className="text-headline-md text-on-surface">Incident Log</h3>
        <Link to="/logs" className="text-label-caps text-primary">
          VIEW ALL
        </Link>
      </div>
      <div className="flex-1 space-y-md overflow-y-auto p-md">
        {incidents.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">No incidents recorded.</p>
        )}
        {incidents.map((incident) => {
          const resolved = !!incident.resolvedAt;
          return (
            <div key={incident.id} className="flex items-start gap-sm">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-l-4 ${
                  resolved
                    ? 'border-secondary bg-secondary-container/10'
                    : 'border-error bg-error-container/10'
                }`}
              >
                <MaterialIcon
                  name={resolved ? 'restore' : 'emergency_home'}
                  className={resolved ? 'text-secondary' : 'text-error'}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-semibold text-on-surface">
                  {incident.device?.name ?? incident.deviceId}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {resolved
                    ? `Recovered after ${formatDuration(incident.duration)}`
                    : 'Ongoing outage'}
                </p>
                <p className="text-[10px] text-data-mono text-on-surface-variant">
                  {formatRelativeTime(incident.startedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
