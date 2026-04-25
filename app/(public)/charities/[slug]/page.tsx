import { mockCharities } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Users, Target } from "lucide-react";

export default function CharityProfilePage({ params }: { params: { slug: string } }) {
  const charity = mockCharities.find(c => c.slug === params.slug);

  if (!charity) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] flex items-end pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-black/30 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
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
                {charity.description}
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-fraunces mb-6 text-text">Upcoming Events</h2>
              {charity.upcomingEvents.length > 0 ? (
                <div className="grid gap-4">
                  {charity.upcomingEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                      <div className="h-12 w-12 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-accent-warm" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text">{event.title}</h4>
                        <p className="text-sm text-muted">
                          {new Date(event.date).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted italic">No upcoming events scheduled at this time.</p>
              )}
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
                    <div className="text-2xl font-mono font-bold text-text">£{charity.totalRaised.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent-warm/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-accent-warm" />
                  </div>
                  <div>
                    <div className="text-sm text-muted uppercase tracking-wider mb-1">Active Supporters</div>
                    <div className="text-2xl font-mono font-bold text-text">{charity.subscriberCount}</div>
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full h-14 text-lg shadow-[0_0_15px_rgba(0,229,153,0.2)] hover:shadow-[0_0_25px_rgba(0,229,153,0.4)]">
                <Link href={`/subscribe?charity=${charity.id}`}>Support This Charity</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
