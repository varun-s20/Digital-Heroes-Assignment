import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className }: StatCardProps) {
  return (
    <Card className={cn("bg-surface border-border", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted">{title}</p>
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-text">{value}</div>
          {trend && (
            <p className={cn("text-xs mt-1", trendUp ? "text-success" : "text-muted")}>
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
