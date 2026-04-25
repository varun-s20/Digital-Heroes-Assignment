"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { createPortalSession, updateContributionPct } from "@/app/actions/subscription";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

type Subscription = {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  charity_contribution_pct: number;
} | null;

interface Props {
  userId: string;
  profile: Profile;
  subscription: Subscription;
}

export default function SettingsClient({ userId, profile, subscription }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullName, setFullName] = useState(profile.full_name);
  const [contributionPct, setContributionPct] = useState(subscription?.charity_contribution_pct ?? 10);

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userId);
      if (err) { setError(err.message); return; }
      setSuccess('Profile updated successfully.');
      router.refresh();
    });
  };

  const handleUpdateContribution = async () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateContributionPct(userId, contributionPct);
      if (!result.success) { setError(result.error ?? 'Failed to update.'); return; }
      setSuccess('Contribution percentage updated. Takes effect on next billing cycle.');
    });
  };

  const handleManageSubscription = async () => {
    startTransition(async () => {
      const result = await createPortalSession();
      if (!result.success) { setError(result.error ?? 'Failed to open portal.'); return; }
      if (result.data?.url) window.location.href = result.data.url;
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-2">Settings</h1>
        <p className="text-muted">Manage your profile, security, and subscription.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">{success}</div>
      )}

      <div className="grid gap-8">
        {/* Profile */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-bg border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar_url || `https://i.pravatar.cc/150?u=${userId}`}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile.email} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted">Email cannot be changed here.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-6">
            <Button onClick={handleSaveProfile} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Subscription */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>View your current plan and billing details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription ? (
              <>
                <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-bg/50">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-text uppercase tracking-wider">{subscription.plan} Plan</span>
                      <Badge className={subscription.status === 'active' ? 'bg-accent text-black' : 'bg-muted text-text'}>
                        {subscription.cancel_at_period_end ? 'Cancelling' : subscription.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xl">{subscription.plan === 'monthly' ? '£9.99/mo' : '£99.90/yr'}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Charity Contribution: <strong className="text-accent-warm">{contributionPct}%</strong></Label>
                  <input
                    type="range"
                    min={10} max={30} step={5}
                    value={contributionPct}
                    onChange={e => setContributionPct(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">Changes take effect on your next billing cycle.</p>
                  <Button size="sm" variant="outline" onClick={handleUpdateContribution} disabled={isPending}>
                    Update Contribution
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-muted text-sm">
                No active subscription found.{' '}
                <a href="/subscribe" className="text-accent hover:underline">Subscribe now →</a>
              </div>
            )}
          </CardContent>
          {subscription && (
            <CardFooter className="border-t border-border pt-6 flex justify-between">
              <Button variant="outline" onClick={handleManageSubscription} disabled={isPending}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Refresh Settings (Billing Bypassed)
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Account */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Sign out of your account.</CardDescription>
          </CardHeader>
          <CardFooter className="border-t border-border pt-6">
            <Button variant="destructive" className="bg-danger/10 text-danger hover:bg-danger/20 border-0" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
