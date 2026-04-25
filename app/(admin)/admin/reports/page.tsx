import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { CreditCard, Heart, Trophy, TrendingUp } from "lucide-react";

interface CharityStat {
  charity_id: string;
  charities: { name: string } | null;
  total: number;
  percent: number;
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  // Fetch aggregated stats
  const [
    { count: monthlyCount },
    { count: yearlyCount },
    { data: contributions },
    { data: draws },
  ] = await Promise.all([
    adminSupabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("plan", "monthly"),
    adminSupabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("plan", "yearly"),
    adminSupabase
      .from("charity_contributions")
      .select("amount, charity_id, charities(name)"),
    adminSupabase
      .from("draws")
      .select("prize_pool_total, status")
      .eq("status", "published"),
  ]);

  const monthlyRevenue = (monthlyCount ?? 0) * 9.99;
  const yearlyRevenue = (yearlyCount ?? 0) * 99.9;
  const totalRevenue = monthlyRevenue + yearlyRevenue;

  const totalCharityRaised = contributions
    ? contributions.reduce((acc: number, c: { amount: number }) => acc + c.amount, 0)
    : 0;

  const totalPrizesPaid = draws
    ? draws.reduce((acc: number, d: { prize_pool_total: number | null }) => acc + (d.prize_pool_total ?? 0), 0)
    : 0;

  // Group charity contributions
  const charityTotals: Record<string, { name: string; total: number }> = {};
  (contributions as any[] ?? []).forEach((c) => {
    if (!c.charity_id) return;
    
    // Supabase can return joined data as an array or a single object
    const charitiesData = Array.isArray(c.charities) ? c.charities[0] : c.charities;
    const charityName = charitiesData?.name ?? "Unknown";

    if (!charityTotals[c.charity_id]) {
      charityTotals[c.charity_id] = {
        name: charityName,
        total: 0,
      };
    }
    charityTotals[c.charity_id].total += c.amount;
  });

  const sortedCharities: CharityStat[] = Object.entries(charityTotals)
    .map(([charity_id, { name, total }]) => ({
      charity_id,
      charities: { name },
      total,
      percent: totalCharityRaised > 0 ? Math.round((total / totalCharityRaised) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-fraunces font-bold mb-1">Financial Reports</h1>
          <p className="text-muted">
            Platform financials and charity distributions — all-time figures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Subscription Revenue"
          value={`£${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={CreditCard}
          trend={`${(monthlyCount ?? 0) + (yearlyCount ?? 0)} active subs`}
          trendUp
        />
        <StatCard
          title="Monthly Subscribers"
          value={(monthlyCount ?? 0).toLocaleString()}
          icon={TrendingUp}
          trend={`£${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} MRR`}
          trendUp
        />
        <StatCard
          title="Total Charity Raised"
          value={`£${totalCharityRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Heart}
          trend={
            totalRevenue > 0
              ? `${Math.round((totalCharityRaised / totalRevenue) * 100)}% of revenue`
              : "No revenue yet"
          }
        />
        <StatCard
          title="Prize Pools Paid Out"
          value={`£${totalPrizesPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Trophy}
          trend={`${draws?.length ?? 0} published draws`}
        />
      </div>

      {/* Subscription Breakdown */}
      <Card className="bg-[#050608] border-border">
        <CardHeader>
          <CardTitle>Subscription Breakdown</CardTitle>
          <CardDescription>Active plans split by type.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly Plans — {monthlyCount ?? 0} subscribers</span>
                <span className="font-mono font-bold text-accent">
                  £{monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo
                </span>
              </div>
              <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{
                    width: `${
                      (monthlyCount ?? 0) + (yearlyCount ?? 0) > 0
                        ? ((monthlyCount ?? 0) / ((monthlyCount ?? 0) + (yearlyCount ?? 0))) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Annual Plans — {yearlyCount ?? 0} subscribers</span>
                <span className="font-mono font-bold text-accent-warm">
                  £{yearlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} / yr
                </span>
              </div>
              <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-warm/80 rounded-full"
                  style={{
                    width: `${
                      (monthlyCount ?? 0) + (yearlyCount ?? 0) > 0
                        ? ((yearlyCount ?? 0) / ((monthlyCount ?? 0) + (yearlyCount ?? 0))) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charity Distribution */}
      <Card className="bg-[#050608] border-border">
        <CardHeader>
          <CardTitle>Charity Distribution Summary</CardTitle>
          <CardDescription>
            Breakdown of funds raised per charity — all time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCharities.length > 0 ? (
            <div className="space-y-6 pt-4">
              {sortedCharities.map((c) => (
                <div key={c.charity_id} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-text">
                      {c.charities?.name ?? "Unknown"}
                    </span>
                    <span className="font-mono font-bold text-accent-warm">
                      £
                      {c.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-warm/80 rounded-full transition-all"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted text-right">
                    {c.percent}% of total charity raised
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted text-sm">
              No charity contributions recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
