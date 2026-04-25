"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-accent" />
          <span className="font-fraunces text-xl font-bold italic tracking-tight text-text">Fairway Impact</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/how-it-works" className="text-sm font-medium text-muted hover:text-text transition-colors">
            How It Works
          </Link>
          <Link href="/charities" className="text-sm font-medium text-muted hover:text-text transition-colors">
            Charities
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-text transition-colors hidden sm:block">
            Login
          </Link>
          <Button asChild className="rounded-full shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_25px_rgba(0,229,153,0.5)] transition-all">
            <Link href="/subscribe">Subscribe</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
