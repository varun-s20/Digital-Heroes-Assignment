import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-accent" />
            <span className="font-fraunces text-xl font-bold italic tracking-tight text-text">Fairway Impact</span>
          </Link>
          <p className="text-muted text-sm max-w-sm mb-6">
            Play for good. Every score entered contributes to meaningful change across the globe. Join the movement today.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-text mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/how-it-works" className="hover:text-accent transition-colors">How It Works</Link></li>
            <li><Link href="/charities" className="hover:text-accent transition-colors">Supported Charities</Link></li>
            <li><Link href="/draws" className="hover:text-accent transition-colors">Recent Draws</Link></li>
            <li><Link href="/subscribe" className="hover:text-accent transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-text mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-accent transition-colors">Responsible Play</Link></li>
            <li><Link href="#" className="hover:text-accent transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} Fairway Impact. All rights reserved. Not a real gambling platform. For charity purposes only.
      </div>
    </footer>
  );
}
