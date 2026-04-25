import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, UserCheck, Trophy, HeartHandshake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminOverviewPage() {
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

  // Fetch real stats
  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: latestDraw },
    { data: charityContribs },
  ] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    adminSupabase
      .from("draws")
      .select("prize_pool_total, draw_month, status")
      .eq("status", "published")
      .order("draw_month", { ascending: false })
      .limit(1),
    adminSupabase.from("charity_contributions").select("amount"),
  ]);

  const latestDrawPool = latestDraw?.[0]?.prize_pool_total ?? 0;
  const totalCharityRaised = charityContribs
    ? charityContribs.reduce((acc: number, c: { amount: number }) => acc + c.amount, 0)
    : 0;

  // Recent 6 months of subscription data for mini chart
  const { data: subscriptionHistory } = await adminSupabase
    .from("subscriptions")
    .select("created_at")
    .order("created_at", { ascending: true });

  // Group into last 6 months
  const monthCounts: Record<string, number> = {};
  (subscriptionHistory ?? []).forEach((sub: { created_at: string }) => {
    const m = new Date(sub.created_at).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  });
  const chartData = Object.entries(monthCounts).slice(-6);
  const maxCount = Math.max(...chartData.map(([, v]) => v), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-2 text-accent-warm">
          Platform Overview
        </h1>
        <p className="text-muted">
          High-level metrics and quick actions for the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={(totalUsers ?? 0).toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Active Subscribers"
          value={(activeSubscribers ?? 0).toLocaleString()}
          icon={UserCheck}
          trendUp
        />
        <StatCard
          title="Last Draw Pool"
          value={`£${latestDrawPool.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Trophy}
          trend="Last published draw"
        />
        <StatCard
          title="Total Charity Raised"
          value={`£${totalCharityRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={HeartHandshake}
          trend="All-time"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#050608] border-border shadow-xl">
            <CardHeader>
              <CardTitle>Subscriber Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-48 flex items-end gap-2 pt-4">
                  {chartData.map(([month, count]) => (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div
                        className="w-full bg-accent-warm/20 rounded-t-md relative overflow-hidden transition-all group-hover:bg-accent-warm/40"
                        style={{ height: `${(count / maxCount) * 100}%`, minHeight: "4px" }}
                      >
                        <div className="absolute top-2 w-full text-center text-xs font-mono font-bold text-accent-warm opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </div>
                      </div>
                      <div className="text-xs text-muted text-center">{month}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted text-sm">
                  No subscription data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#050608] border-accent-warm/30 shadow-[0_0_20px_rgba(245,166,35,0.05)]">
            <CardHeader>
              <CardTitle>Admin Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start h-12 bg-accent-warm hover:bg-accent-warm/90 text-black shadow-none"
                asChild
              >
                <Link href="/admin/draws">Configure Next Draw</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-border"
                asChild
              >
                <Link href="/admin/winners">Verify Pending Winners</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-border"
                asChild
              >
                <Link href="/admin/charities">Manage Charities</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-border"
                asChild
              >
                <Link href="/admin/users">Manage Users</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-border"
                asChild
              >
                <Link href="/admin/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
