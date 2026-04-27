"use client";

import { useState, useTransition } from "react";
import { CharityCard } from "@/components/charity/CharityCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Loader2, CheckCircle } from "lucide-react";
import { updateSubscriptionCharity, updateContributionPct } from "@/app/actions/subscription";
import { useRouter } from "next/navigation";

interface Charity {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  image_url: string | null;
  total_raised?: number;
  subscriber_count?: number;
}

interface Props {
  userId: string;
  subscriptionId: string | null;
  currentCharityId: string | null;
  currentContributionPct: number;
  charities: Charity[];
  planAmount: number;
}

export default function CharityDashboardClient({
  userId,
  subscriptionId,
  currentCharityId,
  currentContributionPct,
  charities,
  planAmount,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCharityId, setSelectedCharityId] = useState(currentCharityId ?? "");
  const [contribution, setContribution] = useState([currentContributionPct]);
  const [isChanging, setIsChanging] = useState(false);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentCharity = charities.find((c) => c.id === selectedCharityId) ?? charities[0];

  const filteredCharities = charities.filter(
    (c) =>
      c.id !== currentCharity?.id &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSwitchCharity = (charityId: string) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateSubscriptionCharity(userId, charityId);
      if (!result.success) {
        setError(result.error ?? "Failed to update charity.");
        return;
      }
      setSelectedCharityId(charityId);
      setIsChanging(false);
      setSuccess("Charity updated successfully!");
      router.refresh();
    });
  };

  const handleSaveContribution = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateContributionPct(userId, contribution[0]);
      if (!result.success) {
        setError(result.error ?? "Failed to update contribution.");
        return;
      }
      setSuccess("Contribution percentage updated!");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-2">My Charity</h1>
        <p className="text-muted">Manage your selected cause and contribution percentage.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!subscriptionId && (
        <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/5 p-5">
          <p className="font-semibold text-accent-warm">No active subscription</p>
          <p className="text-sm text-muted mt-1">
            You need an active subscription to manage your charity preferences.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 h-full">
          <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold font-fraunces mb-4">Currently Supporting</h2>
            {currentCharity ? (
              <CharityCard charity={currentCharity} />
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-muted text-sm">
                No charity selected yet. Browse below to choose one.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Contribution Settings</CardTitle>
              <CardDescription>
                Adjust the percentage of your subscription fee that goes directly to your charity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <Label>Charity Split</Label>
                  <span className="text-3xl font-mono font-bold text-accent-warm">
                    {contribution[0]}%
                  </span>
                </div>
                <Slider
                  value={contribution}
                  onValueChange={setContribution}
                  max={30}
                  min={10}
                  step={5}
                  className="py-4"
                  disabled={!subscriptionId || isPending}
                />
                <p className="text-xs text-muted mt-4">
                  Based on your ₹{planAmount.toFixed(2)}/mo plan, your charity receives{" "}
                  <strong className="text-text">
                    ₹{(planAmount * (contribution[0] / 100)).toFixed(2)}
                  </strong>{" "}
                  every month.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-6">
              <Button
                onClick={handleSaveContribution}
                disabled={!subscriptionId || isPending}
                variant="outline"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Independent Donation</CardTitle>
              <CardDescription>
                Want to give more? Make a one-off donation independent of your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
                  <Input type="number" placeholder="50.00" className="pl-8" />
                </div>
                <Button variant="outline" disabled>
                  Donate Now
                </Button>
              </div>
              <p className="text-xs text-muted mt-3">
                One-off donations coming soon via Stripe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-fraunces">Switch Charity</h2>
          <Button
            variant={isChanging ? "default" : "outline"}
            onClick={() => setIsChanging(!isChanging)}
            disabled={!subscriptionId || isPending}
          >
            {isChanging ? "Cancel" : "Browse Charities"}
          </Button>
        </div>

        {isChanging && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <Input
                placeholder="Search charities or categories..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredCharities.length === 0 ? (
              <p className="text-muted text-sm py-8 text-center">
                No other charities found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharities.map((charity) => (
                  <div key={charity.id} className="relative group">
                    <CharityCard charity={charity} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm z-30">
                      <Button
                        className="shadow-xl"
                        disabled={isPending}
                        onClick={() => handleSwitchCharity(charity.id)}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Select This Charity
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
