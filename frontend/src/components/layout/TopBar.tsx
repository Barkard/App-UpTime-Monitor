import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MaterialIcon } from '../icons/MaterialIcon';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/helpers';
import { NAV_ITEMS } from '../../utils/constants';

export function TopBar() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const title =
    NAV_ITEMS.find((item) =>
      item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path),
    )?.label ?? 'Dashboard';

  const handleRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-20 ml-60 flex h-24 items-center justify-between border-b border-outline-variant bg-background/80 px-xl backdrop-blur">
      <div className="flex items-center gap-lg">
        <h1 className="text-headline-md font-bold text-primary">{title}</h1>
        <div className="relative">
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="search"
            placeholder="Search devices, logs..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'rounded-full border border-transparent bg-surface-container-low py-2 pl-10 pr-4 text-body-sm text-on-surface outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20',
              searchFocused ? 'w-96' : 'w-64',
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-sm">
        <Button variant="secondary" onClick={handleRefresh} aria-label="Refresh data">
          <MaterialIcon
            name="refresh"
            className={cn('!text-lg transition-transform duration-500', refreshing && 'rotate-[360deg]')}
          />
          Refresh
        </Button>
        <Button variant="ghost" aria-label="Notifications" className="relative">
          <MaterialIcon name="notifications" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        </Button>
        <Avatar name="Ops Admin" />
      </div>
    </header>
  );
}
