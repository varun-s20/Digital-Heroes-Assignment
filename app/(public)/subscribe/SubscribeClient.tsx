"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/subscription";
import { useRouter } from "next/navigation";

interface Charity {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  image_url: string | null;
}

interface Props {
  charities: Charity[];
}

export default function SubscribeClient({ charities }: Props) {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(charities[0]?.id ?? "");
  const [contribution, setContribution] = useState([20]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = () => {
    if (!selectedCharity) {
      setError("Please select a charity before proceeding.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(
        isYearly ? "yearly" : "monthly",
        selectedCharity,
        contribution[0]
      );
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    });
  };

  const price = isYearly ? 99.90 : 9.99;
  const charityAmount = (price * contribution[0] / 100).toFixed(2);
  const poolAmount = (price * (100 - contribution[0]) / 100).toFixed(2);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-h1 font-fraunces mb-4">Join the Movement</h1>
          <p className="text-xl text-muted">Configure your subscription and start playing for good.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Plan + Charity */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold font-fraunces mb-6">1. Choose a Plan</h2>
              <div className="flex p-1 bg-surface rounded-lg border border-border mb-6 w-full max-w-xs">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isYearly ? "bg-accent text-bg shadow-sm" : "text-muted hover:text-text"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isYearly ? "bg-accent text-bg shadow-sm" : "text-muted hover:text-text"}`}
                >
                  Yearly
                </button>
              </div>

              <Card className="bg-surface border-accent/30 relative">
                {isYearly && (
                  <div className="absolute -top-3 right-4 bg-accent text-bg text-xs font-bold px-2 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{isYearly ? "Annual Commitment" : "Flexible Monthly"}</CardTitle>
                  <CardDescription>
                    {isYearly ? "Save 16% over the year." : "Cancel anytime, no questions asked."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-mono font-bold text-text">£{isYearly ? "99.90" : "9.99"}</span>
                    <span className="text-muted">/{isYearly ? "year" : "month"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-bold font-fraunces mb-6">2. Choose a Charity</h2>
              {charities.length === 0 ? (
                <div className="text-muted text-sm py-8 text-center">No charities available at this time.</div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {charities.map(charity => (
                    <div
                      key={charity.id}
                      onClick={() => setSelectedCharity(charity.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                        selectedCharity === charity.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-surface hover:border-accent/30"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${selectedCharity === charity.id ? "border-accent bg-accent" : "border-muted"}`}>
                        {selectedCharity === charity.id && <Check className="h-3 w-3 text-bg" />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-sm truncate">{charity.name}</span>
                        <span className="text-xs text-muted truncate capitalize">{charity.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Contribution + Order Summary */}
          <div className="space-y-8">
            <div className="bg-surface border border-border p-6 rounded-2xl sticky top-24">
              <h2 className="text-xl font-bold font-fraunces mb-6">3. Set Contribution</h2>
              <p className="text-sm text-muted mb-6">
                Choose what percentage of your subscription goes directly to your selected charity. (10% – 30%)
              </p>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <Label>Charity Split</Label>
                  <span className="text-2xl font-mono font-bold text-accent-warm">{contribution[0]}%</span>
                </div>
                <Slider
                  value={contribution}
                  onValueChange={setContribution}
                  max={30}
                  min={10}
                  step={5}
                />
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold text-text mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subscription ({isYearly ? "Yearly" : "Monthly"})</span>
                  <span className="font-mono font-medium">£{price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Charity Allocation ({contribution[0]}%)</span>
                  <span className="font-mono font-medium text-accent-warm">£{charityAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Prize Pool & Platform</span>
                  <span className="font-mono font-medium">£{poolAmount}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <Button
                  onClick={handleSubscribe}
                  className="w-full h-14 text-lg shadow-[0_0_20px_rgba(0,229,153,0.2)]"
                  disabled={isPending || !selectedCharity}
                >
                  {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Complete Subscription
                </Button>
                <p className="text-xs text-center text-muted mt-4">
                  Powered by Stripe — secure payment processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
