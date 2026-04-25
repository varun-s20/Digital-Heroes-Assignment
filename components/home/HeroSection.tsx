"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle animated background (CSS noise / gradient) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-bg to-bg" />
      <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Decorative glowing orb */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-64 h-[500px] w-[500px] rounded-full bg-accent blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 -left-64 h-[600px] w-[600px] rounded-full bg-accent-warm blur-[150px]" 
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-accent backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse" />
            Over ₹250,000 raised for charities this year
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-hero leading-[1.1] tracking-tight">
            Play for the <span className="font-fraunces italic text-accent drop-shadow-[0_0_20px_rgba(0,229,153,0.3)]">Win.</span><br />
            Stand for the <span className="font-fraunces italic text-accent-warm drop-shadow-[0_0_20px_rgba(245,166,35,0.3)]">Good.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Turn your weekend stableford scores into life-changing charity donations and massive monthly cash prizes. The ultimate win-win.
          </motion.p>
          
          <motion.div variants={fadeUp} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="rounded-full h-14 px-8 text-lg font-medium shadow-[0_0_20px_rgba(0,229,153,0.25)] hover:shadow-[0_0_35px_rgba(0,229,153,0.4)] transition-all w-full sm:w-auto">
              <Link href="/subscribe">Start Playing for Good</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full h-14 px-8 text-lg font-medium border-border hover:bg-surface w-full sm:w-auto">
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
