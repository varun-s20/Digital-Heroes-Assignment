"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandPlot, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <LandPlot className="h-6 w-6 text-accent" />
          <span className="font-fraunces text-xl font-bold italic tracking-tight text-text">BirdieFund</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/how-it-works" className="text-sm font-medium text-muted hover:text-text transition-colors">
            How It Works
          </Link>
          <Link href="/charities" className="text-sm font-medium text-muted hover:text-text transition-colors">
            Charities
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-text transition-colors">
            Login
          </Link>
          <Button asChild className="rounded-full shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_25px_rgba(0,229,153,0.5)] transition-all">
            <Link href="/subscribe">Subscribe</Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden p-2 text-muted hover:text-text"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-bg px-4 py-6 space-y-6">
          <div className="flex flex-col gap-4">
            <Link href="/how-it-works" onClick={() => setIsOpen(false)} className="text-lg font-medium text-text">
              How It Works
            </Link>
            <Link href="/charities" onClick={() => setIsOpen(false)} className="text-lg font-medium text-text">
              Charities
            </Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-text">
              Login
            </Link>
          </div>
          <div className="pt-4 border-t border-border">
            <Button asChild className="w-full h-12 text-lg rounded-full shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_25px_rgba(0,229,153,0.5)] transition-all">
              <Link href="/subscribe" onClick={() => setIsOpen(false)}>Subscribe</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
