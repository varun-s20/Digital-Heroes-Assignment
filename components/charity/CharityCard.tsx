import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Accepts both the old mock camelCase shape and the DB snake_case shape
export interface CharityCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  category: string;
  totalRaised?: number;
  total_raised?: number;
  subscriberCount?: number;
  subscriber_count?: number;
  status?: string;
}

export function CharityCard({ charity }: { charity: CharityCardProps }) {
  const imageUrl = charity.image_url ?? charity.imageUrl ?? null;
  const totalRaised = charity.total_raised ?? charity.totalRaised ?? 0;
  const subscriberCount = charity.subscriber_count ?? charity.subscriberCount ?? 0;

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-surface border-border hover:border-accent/50 transition-colors group">
      <div className="relative h-48 w-full overflow-hidden bg-bg">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={charity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            No image
          </div>
        )}
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="secondary" className="bg-bg/80 backdrop-blur-md border-border">
            {charity.category}
          </Badge>
        </div>
      </div>
      <CardContent className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-fraunces font-bold mb-2 text-text line-clamp-1">
          {charity.name}
        </h3>
        <p className="text-muted text-sm line-clamp-3 mb-6 flex-1">
          {charity.description ?? "Supporting a great cause."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mb-6">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider mb-1">Raised</div>
            <div className="font-mono font-bold text-accent">
              £{Number(totalRaised).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted uppercase tracking-wider mb-1">Supporters</div>
            <div className="font-mono font-bold text-text">{Number(subscriberCount).toLocaleString()}</div>
          </div>
        </div>

        <Button asChild className="w-full" variant="outline">
          <Link href={`/charities/${charity.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
