"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useEffect, useState } from "react";
import { mockDraws } from "@/lib/mock-data";

export function DrawMechanicsSection() {
  const upcomingDraw = mockDraws.find(d => d.status === 'upcoming')!;
  
  // Simple countdown logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date(upcomingDraw.date).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingDraw.date]);

  return (
    <section className="py-24 bg-bg border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <motion.h2 variants={fadeUp} className="text-h2 font-fraunces">
              How the Draw Works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-lg">
              Every month, we draw 5 numbers from the pool of submitted stableford scores (1-45). Match your latest 5 scores to win.
            </motion.p>
            
            <motion.div variants={fadeUp} className="space-y-4">
              {upcomingDraw.tiers?.map((tier, idx) => (
                <div key={idx} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                      {tier.matchCount}
                    </div>
                    <span className="font-medium">Match {tier.matchCount} Numbers</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-text">Est. £{tier.prizePerWinner?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-muted">Prize per winner</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-surface to-bg border border-border p-8 md:p-12 text-center shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-warm" />
              <h3 className="text-xl font-medium mb-2 text-muted">Next Draw</h3>
              <p className="text-3xl font-fraunces font-bold mb-10">
                {new Date(upcomingDraw.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
              
              <div className="flex justify-center gap-4 md:gap-6">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-bg border border-border rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                      <span className="text-2xl md:text-3xl font-mono font-bold text-accent">
                        {value.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-xs text-muted uppercase tracking-wider">{unit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm text-muted">
                  Estimated Total Prize Pool: <span className="text-text font-mono font-bold">£{upcomingDraw.estimatedPrizePool?.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
