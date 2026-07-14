import { PulseVisualization } from '../components/logs/PulseVisualization';
import { HealthSummary } from '../components/logs/HealthSummary';
import { LiveLogTable } from '../components/logs/LiveLogTable';

export function Logs() {
  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PulseVisualization />
        </div>
        <div className="lg:col-span-4">
          <HealthSummary />
        </div>
      </div>
      <LiveLogTable />
    </div>
  );
}
