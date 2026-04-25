import Link from "next/link";
import { LandPlot } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#050608] border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <LandPlot className="h-6 w-6 text-accent" />
              <span className="font-fraunces text-xl font-bold italic tracking-tight text-text">BirdieFund</span>
            </Link>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Empowering golfers to make a difference. Play your game, log your scores, and support the causes you care about.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted hover:text-accent transition-colors">Twitter</Link>
              <Link href="#" className="text-sm text-muted hover:text-accent transition-colors">GitHub</Link>
              <Link href="#" className="text-sm text-muted hover:text-accent transition-colors">LinkedIn</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-text">Platform</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="/how-it-works" className="hover:text-accent transition-colors">How it Works</Link></li>
              <li><Link href="/charities" className="hover:text-accent transition-colors">Charities</Link></li>
              {/* <li><Link href="/winners" className="hover:text-accent transition-colors">Past Winners</Link></li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-text">Legal</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              {/* <li><Link href="/responsible-play" className="hover:text-accent transition-colors">Responsible Play</Link></li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-text">Support</h4>
            <ul className="space-y-3 text-sm text-muted">
              {/* <li><Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link></li> */}
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <p>
            &copy; {new Date().getFullYear()} BirdieFund. All rights reserved. Not a real gambling platform. For charity purposes only.
          </p>
          <div className="flex gap-4">
            <span>Registered in UK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
