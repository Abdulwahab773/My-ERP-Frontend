import { Card, Skeleton } from '../../components/ui';

export function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="page-hero">
        <Skeleton width={120} height={14} />
        <div style={{ marginTop: 12 }}><Skeleton width="48%" height={42} /></div>
      </div>
      <div className="quick-actions">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} width={120} height={34} radius={12} />
        ))}
      </div>
      <div className="dash-summary-grid">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index}><Skeleton height={72} /></Card>
        ))}
      </div>
      <div className="dash-balance-grid">
        <Card><Skeleton height={140} /></Card>
        <Card><Skeleton height={140} /></Card>
      </div>
      <div className="dash-analytics-grid">
        <Card><Skeleton height={240} /></Card>
        <Card><Skeleton height={240} /></Card>
      </div>
    </div>
  );
}
