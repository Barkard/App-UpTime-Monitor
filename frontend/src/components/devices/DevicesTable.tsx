import {
  Table,
  TableBody,
  TableHeader,
  TableHeadCell,
  TableRow,
  TableCell,
} from '../ui/Table';
import { Pagination } from '../ui/Pagination';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { DeviceRow } from './DeviceRow';
import type { PaginatedResult } from '../../types/api';
import type { Device } from '../../types/device';

interface DevicesTableProps {
  result?: PaginatedResult<Device>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const COLUMNS = ['Device Name', 'Host', 'Type', 'Last Check', 'Status', 'Actions'];

export function DevicesTable({ result, isLoading, onPageChange }: DevicesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHeadCell key={col}>{col}</TableHeadCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={COLUMNS.length}>
                  <LoadingSkeleton className="h-8" />
                </TableCell>
              </TableRow>
            ))}
          {!isLoading && result?.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} className="text-center text-on-surface-variant">
                No devices found.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && result?.data.map((device) => <DeviceRow key={device.id} device={device} />)}
        </TableBody>
      </Table>
      {result?.meta.pagination && (
        <Pagination pagination={result.meta.pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
