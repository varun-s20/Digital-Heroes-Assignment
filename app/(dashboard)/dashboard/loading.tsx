export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-64 bg-surface rounded-xl" />
      <div className="h-5 w-96 bg-surface rounded-lg" />
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 h-24" />
        ))}
      </div>
    </div>
  );
}
