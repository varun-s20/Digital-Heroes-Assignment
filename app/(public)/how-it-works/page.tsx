import { CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-20">
          <h1 className="text-hero font-fraunces mb-6">The Mechanics of Good</h1>
          <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            We’ve combined the thrill of the game with the power of giving. Here’s a deep dive into exactly how your scores translate into prizes and impact.
          </p>
        </div>

        <div className="space-y-32">
          {/* Section 1 */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="text-accent font-mono font-bold text-sm uppercase tracking-widest">Phase 01</div>
              <h2 className="text-h2 font-fraunces">Score Entry Rules</h2>
              <p className="text-muted leading-relaxed">
                As an active subscriber, you can log up to 5 Stableford scores from any amateur round you play. We use a rolling window system — meaning once you hit 5 scores, your oldest score drops off to make room for the new one.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                  <span className="text-text">Scores must be between 1 and 45 points.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                  <span className="text-text">Scores must be from genuine 18-hole rounds.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                  <span className="text-text">You must maintain 5 active scores to be eligible for the top prize tier.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-surface border border-border p-8 rounded-3xl relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 to-transparent rounded-3xl" />
              <div className="relative z-10 space-y-4">
                {[41, 35, 38, 22, 19].map((score, i) => (
                  <div key={i} className={`h-12 w-full rounded-lg border flex items-center justify-between px-4 ${i === 4 ? 'bg-bg border-accent/50 opacity-50' : 'bg-bg border-border'}`}>
                    <span className="text-sm text-muted">Round {5-i}</span>
                    <span className="font-mono font-bold text-lg">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="text-accent font-mono font-bold text-sm uppercase tracking-widest">Phase 02</div>
              <h2 className="text-h2 font-fraunces">The Monthly Draw</h2>
              <p className="text-muted leading-relaxed">
                On the first of every month, we conduct a verifiable algorithmic draw. 5 numbers are randomly selected from the pool of all submitted scores across the platform. 
              </p>
              <p className="text-muted leading-relaxed">
                If the numbers drawn match the numbers in your active score history, you win a share of that tier's prize pool.
              </p>
            </div>
            <div className="flex-1 bg-surface border border-border p-8 rounded-3xl">
              <h3 className="text-lg font-bold mb-6 text-center text-muted">Prize Pool Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Match 5 (Jackpot)</span>
                    <span className="font-bold">40%</span>
                  </div>
                  <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[40%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Match 4</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-accent/80 w-[35%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Match 3</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-accent/50 w-[25%]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="text-accent font-mono font-bold text-sm uppercase tracking-widest">Phase 03</div>
              <h2 className="text-h2 font-fraunces">Charity Contribution</h2>
              <p className="text-muted leading-relaxed">
                We believe in transparent giving. When you subscribe, you set your own contribution percentage (minimum 10%, maximum 30%) to go directly to your selected charity.
              </p>
              <p className="text-muted leading-relaxed">
                The remainder of your subscription fee goes directly into the community prize pool and covers platform operating costs. You can change your charity and contribution percentage at any time.
              </p>
            </div>
            <div className="flex-1 bg-surface border border-border p-8 rounded-3xl flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="text-6xl font-fraunces text-accent-warm mb-4">10-30%</div>
                <div className="text-muted uppercase tracking-wider text-sm font-semibold">Direct to Charity</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
