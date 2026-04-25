"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const features = [
  "Enter 5 stableford scores per month",
  "Eligible for all monthly prize draws",
  "Support a charity of your choice",
  "Track your giving impact",
  "Join a community of golfing heroes"
];

export function SubscriptionCTASection() {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-h2 font-fraunces mb-4">Ready to play for good?</motion.h2>
          <motion.p variants={fadeUp} className="text-muted text-lg max-w-2xl mx-auto">
            Choose a plan that works for you. A minimum of 10% from every subscription goes directly to your chosen cause.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div variants={fadeUp}>
            <Card className="h-full flex flex-col bg-bg border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Monthly Plan</CardTitle>
                <CardDescription>Flexible commitment, cancel anytime.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-mono font-bold">₹9.99</span>
                  <span className="text-muted">/month</span>
                </div>
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-sm text-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-12 text-md" variant="outline" asChild>
                  <Link href="/subscribe">Select Monthly</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="h-full flex flex-col bg-bg border-accent/50 relative shadow-[0_0_30px_rgba(0,229,153,0.1)]">
              <div className="absolute -top-3 right-6">
                <Badge className="bg-accent text-bg hover:bg-accent px-3 py-1 text-xs">Best Value</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Yearly Plan</CardTitle>
                <CardDescription>Save 16% with an annual commitment.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-mono font-bold">₹99.90</span>
                  <span className="text-muted">/year</span>
                </div>
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-sm text-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-12 text-md shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_25px_rgba(0,229,153,0.5)]" asChild>
                  <Link href="/subscribe">Select Yearly</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
