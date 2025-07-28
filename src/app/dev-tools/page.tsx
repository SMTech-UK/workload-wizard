import DevToolsPage from '@/components/features/dev-tools/DevToolsPage';
import DevRouteGuard from '@/components/features/dev-tools/DevRouteGuard';

export default function DevToolsPageWrapper() {
  return (
    <DevRouteGuard>
      <DevToolsPage />
    </DevRouteGuard>
  );
} 