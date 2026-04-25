import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenLine } from "lucide-react";

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DrawsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/draws");

  // Fetch user's active scores
  const { data: scores } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(5);

  const activeScores = scores?.map((s) => s.score) ?? [];

  // Fetch next upcoming (pending/simulated) draw
  const { data: nextDraw } = await supabase
    .from("draws")
    .select("draw_month, prize_pool_total, tier_5_pool, tier_4_pool, tier_3_pool")
    .in("status", ["pending", "simulated"])
    .order("draw_month", { ascending: true })
    .limit(1)
    .single();

  // Fetch all published draws
  const { data: publishedDraws } = await supabase
    .from("draws")
    .select("id, draw_month, drawn_numbers, prize_pool_total, jackpot_carried_over, jackpot_carry_amount")
    .eq("status", "published")
    .order("draw_month", { ascending: false });

  // Fetch user's winnings to cross-reference
  const { data: myWinnings } = await supabase
    .from("winnings")
    .select("draw_id, amount, tier, status")
    .eq("user_id", user.id);

  const winningsByDraw = Object.fromEntries(
    (myWinnings ?? []).map((w) => [w.draw_id, w])
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-2">My Draws</h1>
        <p className="text-muted">Track upcoming draws and view past results.</p>
      </div>

      {/* Upcoming Draw */}
      {nextDraw ? (
        <Card className="bg-gradient-to-br from-surface to-bg border-accent/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-warm" />
          <CardHeader>
            <CardTitle>Upcoming Draw</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <div className="text-sm text-muted uppercase tracking-wider mb-1">
                  Draw Month
                </div>
                <div className="text-2xl font-bold font-fraunces">
                  {new Date(nextDraw.draw_month).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <div className="text-sm text-muted mb-2">My Active Numbers</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {activeScores.map((score, i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border border-accent/50 bg-accent/10 flex items-center justify-center font-mono font-bold text-accent"
                      >
                        {score}
                      </div>
                    ))}
                    {activeScores.length < 5 && (
                      <div className="h-10 px-4 rounded-full border border-danger/50 bg-danger/10 flex items-center justify-center text-xs font-semibold text-danger">
                        Need {5 - activeScores.length} more
                      </div>
                    )}
                    {activeScores.length === 0 && (
                      <Button size="sm" asChild>
                        <Link href="/dashboard/scores">
                          <PenLine className="mr-2 h-3 w-3" /> Log Scores
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="text-sm text-muted uppercase tracking-wider mb-1">
                  Est. Prize Pool
                </div>
                <div className="text-2xl font-mono font-bold text-text">
                  {nextDraw.prize_pool_total
                    ? `₹${nextDraw.prize_pool_total.toLocaleString()}`
                    : "Pending calculation"}
                </div>
                {nextDraw.prize_pool_total && (
                  <div className="text-xs text-muted mt-1 space-y-0.5">
                    <div>5-match (jackpot): ₹{((nextDraw.tier_5_pool ?? 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div>4-match: ₹{((nextDraw.tier_4_pool ?? 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div>3-match: ₹{((nextDraw.tier_3_pool ?? 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
          <p className="text-lg font-semibold mb-1">No upcoming draw scheduled.</p>
          <p className="text-sm">The admin will schedule the next draw soon.</p>
        </div>
      )}

      {/* Past Results */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle>Past Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Winning Numbers</TableHead>
                <TableHead>My Matches</TableHead>
                <TableHead>Jackpot</TableHead>
                <TableHead className="text-right">Prize Won</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishedDraws && publishedDraws.length > 0 ? (
                publishedDraws.map((draw) => {
                  const drawnNumbers: number[] = draw.drawn_numbers ?? [];
                  const matchCount = activeScores.filter((s) =>
                    drawnNumbers.includes(s)
                  ).length;
                  const myWin = winningsByDraw[draw.id];

                  return (
                    <TableRow key={draw.id}>
                      <TableCell className="font-medium">
                        {formatMonth(draw.draw_month)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {drawnNumbers.map((num, i) => (
                            <span
                              key={i}
                              className={`text-xs font-mono w-7 h-7 flex items-center justify-center rounded-full font-bold ${
                                activeScores.includes(num)
                                  ? "bg-accent text-bg"
                                  : "bg-bg border border-border text-muted"
                              }`}
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={matchCount >= 3 ? "success" : "secondary"}
                        >
                          {matchCount} Match{matchCount !== 1 ? "es" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {draw.jackpot_carried_over ? (
                          <Badge className="bg-accent-warm text-black text-xs">
                            Rollover
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Won
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {myWin ? (
                          <div>
                            <span className="font-mono font-bold text-accent">
                              ₹{myWin.amount.toLocaleString()}
                            </span>
                            <div className="text-xs text-muted">
                              {myWin.status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted"
                  >
                    No published draws yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
