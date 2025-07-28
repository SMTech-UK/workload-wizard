import DevToolsPage from '@/components/DevToolsPage';
import DevRouteGuard from '@/components/DevRouteGuard';

export default function DevToolsPageWrapper() {
  return (
    <DevRouteGuard>
      <DevToolsPage />
    </DevRouteGuard>
  );
} 