import { Badge } from "@/components/ui/badge";

export function SubscriptionBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge variant="success" className="px-3 py-1">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
        </span>
        Active Subscriber
      </Badge>
    );
  }
  
  if (status === "lapsed") {
    return (
      <Badge variant="destructive" className="px-3 py-1">
        Subscription Lapsed
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="px-3 py-1">
      No Active Plan
    </Badge>
  );
}
