import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { AppRoutes } from './router/routes';

function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
