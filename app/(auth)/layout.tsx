import Link from "next/link";
import { LandPlot } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LandPlot className="h-8 w-8 text-accent" />
            <span className="font-fraunces text-2xl font-bold italic tracking-tight text-text">BirdieFund</span>
          </Link>
        </div>
        
        {children}
      </div>
    </div>
  )
}
