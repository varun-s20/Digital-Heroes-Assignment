"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export function CharityImpactSection() {
  const [count, setCount] = useState(0);
  const target = 142500; // Mock number
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <section className="py-24 bg-bg relative" ref={ref}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-h2 font-fraunces mb-6">Our Collective Impact</h2>
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-hero font-jetbrains-mono font-bold text-accent drop-shadow-[0_0_30px_rgba(0,229,153,0.3)] mb-4"
          >
            ₹{count.toLocaleString('en-IN')}
          </motion.div>
          <p className="text-xl text-muted">Donated to partner charities this month.</p>
        </div>
      </div>
    </section>
  );
}
