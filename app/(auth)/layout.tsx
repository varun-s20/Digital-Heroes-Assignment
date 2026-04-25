import Link from "next/link";
import { Leaf } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -right-64 h-[500px] w-[500px] rounded-full bg-accent blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-64 h-[500px] w-[500px] rounded-full bg-accent-warm blur-[150px] opacity-10 pointer-events-none" />
      
      <Link href="/" className="flex items-center gap-2 mb-8 relative z-10 hover:opacity-80 transition-opacity">
        <Leaf className="h-8 w-8 text-accent" />
        <span className="font-fraunces text-2xl font-bold italic tracking-tight text-text">Fairway Impact</span>
      </Link>
      
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
