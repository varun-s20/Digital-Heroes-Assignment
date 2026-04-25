import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, TrendingUp, Trophy, Heart } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SubscriptionBadge } from "@/components/dashboard/SubscriptionBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DashboardHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  // Fetch subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, current_period_end, charity_id, charity_contribution_pct")
    .eq("user_id", user.id)
    .single();

  // Fetch latest 3 scores
  const { data: scores } = await supabase
    .from("scores")
    .select("id, score, score_date")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(3);

  // Fetch all scores to compute average
  const { data: allScores } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", user.id);

  const avgScore =
    allScores && allScores.length > 0
      ? Math.round(
          allScores.reduce((acc, s) => acc + s.score, 0) / allScores.length
        )
      : 0;

  // Fetch total verified/paid winnings
  const { data: winnings } = await supabase
    .from("winnings")
    .select("amount, status")
    .eq("user_id", user.id)
    .in("status", ["verified", "paid"]);

  const totalWon = winnings
    ? winnings.reduce((acc, w) => acc + w.amount, 0)
    : 0;

  // Fetch next pending/published draw
  const { data: nextDraw } = await supabase
    .from("draws")
    .select("draw_month, prize_pool_total")
    .in("status", ["pending", "simulated"])
    .order("draw_month", { ascending: true })
    .limit(1)
    .single();

  // Fetch charity info
  let charityName = "No charity selected";
  if (subscription?.charity_id) {
    const { data: charity } = await supabase
      .from("charities")
      .select("name")
      .eq("id", subscription.charity_id)
      .single();
    if (charity) charityName = charity.name;
  }

  // Fetch charity contributions total for this user
  const { data: contributions } = await supabase
    .from("charity_contributions")
    .select("amount")
    .eq("user_id", user.id);

  const totalContributed = contributions
    ? contributions.reduce((acc, c) => acc + c.amount, 0)
    : 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const nextDrawDate = nextDraw?.draw_month
    ? new Date(nextDraw.draw_month).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : "TBA";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-fraunces font-bold mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted">
            Here is your impact and performance overview.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {renewalDate && (
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">Next Renewal</div>
              <div className="text-xs text-muted">{renewalDate}</div>
            </div>
          )}
          <SubscriptionBadge
            status={
              (subscription?.status as "active" | "lapsed" | "cancelled") ??
              "inactive"
            }
          />
        </div>
      </div>

      {/* Subscribe prompt if no active subscription */}
      {(!subscription || subscription.status !== "active") && (
        <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <p className="font-semibold text-accent-warm">
              No active subscription
            </p>
            <p className="text-sm text-muted mt-1">
              Subscribe to participate in monthly draws and support your
              charity.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/subscribe">Subscribe Now</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Next Draw Date"
          value={nextDrawDate}
          icon={Calendar}
          trend={
            nextDraw?.prize_pool_total
              ? `Pool: ₹${nextDraw.prize_pool_total.toLocaleString()}`
              : "Draw pending"
          }
        />
        <StatCard
          title="My Score Average"
          value={avgScore > 0 ? avgScore.toString() : "—"}
          icon={TrendingUp}
          trend={
            allScores && allScores.length > 0
              ? `${allScores.length} score${allScores.length > 1 ? "s" : ""} logged`
              : "No scores yet"
          }
          trendUp={avgScore > 0}
        />
        <StatCard
          title="Total Won"
          value={`₹${totalWon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Trophy}
        />
        <StatCard
          title="Charity Contributed"
          value={`₹${totalContributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Heart}
          trend={`To ${charityName}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-fraunces">
                Recent Scores
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-accent hover:text-accent"
              >
                <Link href="/dashboard/scores">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scores && scores.length > 0 ? (
                  scores.map((score) => (
                    <div
                      key={score.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/50"
                    >
                      <div>
                        <div className="font-medium">18-Hole Round</div>
                        <div className="text-sm text-muted">
                          {formatDate(score.score_date)}
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-bold text-accent">
                        {score.score}{" "}
                        <span className="text-sm text-muted">pts</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted">
                    <p className="text-lg mb-2">No scores logged yet.</p>
                    <p className="text-sm mb-4">
                      Add your first Stableford score to join the draw!
                    </p>
                    <Button asChild size="sm">
                      <Link href="/dashboard/scores">
                        <PenLine className="mr-2 h-4 w-4" />
                        Log First Score
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info Card */}
          {subscription && (
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-xl font-fraunces">
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        subscription.plan === "yearly"
                          ? "bg-accent-warm text-black"
                          : "bg-accent/20 text-accent"
                      }
                    >
                      {subscription.plan === "yearly"
                        ? "Annual Plan"
                        : "Monthly Plan"}
                    </Badge>
                    <span className="text-sm text-muted">
                      {subscription.charity_contribution_pct ?? 10}% goes to
                      your charity
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings">Manage</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-surface to-bg border-accent/30 shadow-[0_0_20px_rgba(0,229,153,0.05)]">
            <CardHeader>
              <CardTitle className="text-xl font-fraunces">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start shadow-none h-12" asChild>
                <Link href="/dashboard/scores">
                  <PenLine className="mr-2 h-4 w-4" /> Enter New Score
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border hover:bg-white/5 h-12"
                asChild
              >
                <Link href="/dashboard/draws">
                  <Trophy className="mr-2 h-4 w-4" /> View Draw Results
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border hover:bg-white/5 h-12"
                asChild
              >
                <Link href="/dashboard/charity">
                  <Heart className="mr-2 h-4 w-4" /> Change My Charity
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border hover:bg-white/5 h-12"
                asChild
              >
                <Link href="/dashboard/winnings">
                  <Trophy className="mr-2 h-4 w-4" /> My Winnings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
