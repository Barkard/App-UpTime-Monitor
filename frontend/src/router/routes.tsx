import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Devices } from '../pages/Devices';
import { Logs } from '../pages/Logs';
import { Settings } from '../pages/Settings';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
