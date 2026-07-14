import { NavLink } from 'react-router-dom';
import { MaterialIcon } from '../icons/MaterialIcon';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';
import { NAV_ITEMS } from '../../utils/constants';

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 h-full w-60 border-r border-outline-variant bg-surface-container-lowest flex flex-col">
      <div className="p-lg border-b border-outline-variant">
        <div className="flex items-center gap-sm">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
            <MaterialIcon name="shield" className="text-on-primary-container" />
          </div>
          <div>
            <p className="text-headline-md font-geist text-on-surface leading-tight">
              NetGuard
            </p>
            <p className="text-label-caps text-on-surface-variant">Ops</p>
          </div>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 p-md space-y-xs">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-md py-sm rounded-lg text-body-md transition-colors',
                isActive
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high',
              )
            }
          >
            {({ isActive }) => (
              <>
                <MaterialIcon name={item.icon} filled={isActive} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-md border-t border-outline-variant space-y-md">
        <div className="flex items-center gap-sm">
          <Avatar name="Ops Admin" />
          <div>
            <p className="text-body-sm text-on-surface font-semibold">Ops Admin</p>
            <p className="text-label-caps text-on-surface-variant">SRE</p>
          </div>
        </div>
        <Button variant="primary" className="w-full justify-center">
          <MaterialIcon name="confirmation_number" />
          Support Ticket
        </Button>
      </div>
    </aside>
  );
}
