"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { PenLine, Trophy, HeartHandshake } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Subscribe & Choose",
    desc: "Pick your monthly plan and select the charity you want to support with a portion of your fee.",
    icon: HeartHandshake,
  },
  {
    num: "02",
    title: "Enter Your Scores",
    desc: "Log your stableford scores (1-45) from any weekend round. Your last 5 scores build your draw entry.",
    icon: PenLine,
  },
  {
    num: "03",
    title: "Win & Give",
    desc: "Match your scores in our monthly draw to win huge cash prizes, while your charity receives vital funds.",
    icon: Trophy,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-surface border-y border-border relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-h2 mb-4">Three Steps to Impact</motion.h2>
          <motion.p variants={fadeUp} className="text-muted max-w-xl mx-auto">
            A revolutionary new way to make your golf mean more. It takes less than two minutes to get started.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-bg border border-border flex items-center justify-center mb-6 group-hover:border-accent/50 transition-colors shadow-lg relative">
                <span className="absolute -top-3 -right-3 text-sm font-mono text-accent bg-accent/10 border border-accent/20 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                  {step.num}
                </span>
                <step.icon className="h-10 w-10 text-text group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-xl font-fraunces font-bold mb-3">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
