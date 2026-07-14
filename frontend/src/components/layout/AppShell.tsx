import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useRealtime } from '../../hooks/useRealtime';
import { DeviceFormPanel } from '../devices/DeviceFormPanel';
import { ToastStack } from './ToastStack';

export function AppShell({ children }: { children: ReactNode }) {
  useRealtime();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="ml-60 max-w-[1440px] px-xl pb-xl pt-lg">{children}</main>
      <DeviceFormPanel />
      <ToastStack />
    </div>
  );
}
