import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Target } from "lucide-react";

export default async function CharityProfilePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: charity } = await supabase
    .from("charities")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!charity) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] flex items-end pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-black/30 z-10" />
          {charity.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop" 
              alt="Default charity cover" 
              className="w-full h-full object-cover grayscale opacity-50" 
            />
          )}
        </div>
        
        <div className="container relative z-20 mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-block px-3 py-1 bg-accent/20 border border-accent/30 text-accent rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              {charity.category}
            </div>
            <h1 className="text-hero font-fraunces text-white leading-tight mb-4">{charity.name}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-h2 font-fraunces mb-6 text-text">About the Cause</h2>
              <p className="text-lg text-muted leading-relaxed whitespace-pre-line">
                {charity.description || "No description provided for this charity yet."}
              </p>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface border border-border rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold font-fraunces mb-6">Impact Overview</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted uppercase tracking-wider mb-1">Total Raised</div>
                    <div className="text-2xl font-mono font-bold text-text">£{(charity.total_raised || 0).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent-warm/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-accent-warm" />
                  </div>
                  <div>
                    <div className="text-sm text-muted uppercase tracking-wider mb-1">Active Supporters</div>
                    <div className="text-2xl font-mono font-bold text-text">{charity.subscriber_count || 0}</div>
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full h-14 text-lg shadow-[0_0_15px_rgba(0,229,153,0.2)] hover:shadow-[0_0_25px_rgba(0,229,153,0.4)]">
                <Link href={`/subscribe?charity_id=${charity.id}`}>Support This Charity</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
