"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockCharities } from "@/lib/mock-data";

export function FeaturedCharitySection() {
  const charity = mockCharities[0]; // Ocean Cleanup

  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden bg-bg border border-border shadow-2xl flex flex-col md:flex-row"
        >
          <div className="w-full md:w-1/2 min-h-[300px] relative">
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bg via-bg/50 to-transparent z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={charity.imageUrl} 
              alt={charity.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative z-20">
            <div className="uppercase tracking-widest text-xs font-semibold text-accent mb-4">Featured Cause</div>
            <h3 className="text-h2 font-fraunces mb-4">{charity.name}</h3>
            <p className="text-muted leading-relaxed mb-8">
              {charity.description}
            </p>
            <div className="flex items-center gap-6 mb-8 border-t border-border pt-6">
              <div>
                <div className="text-2xl font-bold font-mono text-text">£{charity.totalRaised.toLocaleString()}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Raised so far</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl font-bold font-mono text-text">{charity.subscriberCount}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Active Supporters</div>
              </div>
            </div>
            <Button asChild className="w-fit">
              <Link href={`/charities/${charity.slug}`}>View Profile & Support</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
