"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, ChevronUp, Loader2, Pencil, Check, X, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminEditScore, adminDeleteScore, adminUpdateSubscriptionStatus } from "@/app/actions/admin-scores";

interface Score {
  id: string;
  score: number;
  score_date: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  charity_contribution_pct: number | null;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  subscriptions: Subscription[] | null;
  scores: Score[] | null;
}

interface Props {
  users: UserRow[];
}

export default function AdminUsersClient({ users }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreEdit, setScoreEdit] = useState({ score: "", date: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const sub = (u: UserRow) => u.subscriptions?.[0] ?? null;

  const handleScoreEdit = (score: Score) => {
    setEditingScoreId(score.id);
    setScoreEdit({ score: String(score.score), date: score.score_date });
  };

  const handleScoreSave = (scoreId: string) => {
    const newScore = parseInt(scoreEdit.score, 10);
    if (isNaN(newScore)) { setError("Invalid score value."); return; }
    setError(null);
    startTransition(async () => {
      const result = await adminEditScore(scoreId, newScore, scoreEdit.date);
      if (!result.success) { setError(result.error ?? "Failed."); return; }
      setSuccess("Score updated.");
      setEditingScoreId(null);
      router.refresh();
    });
  };

  const handleScoreDelete = (scoreId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteScore(scoreId);
      if (!result.success) { setError(result.error ?? "Failed."); return; }
      setSuccess("Score deleted.");
      router.refresh();
    });
  };

  const handleSubStatus = (subId: string, status: "active" | "lapsed" | "cancelled") => {
    setError(null);
    startTransition(async () => {
      const result = await adminUpdateSubscriptionStatus(subId, status);
      if (!result.success) { setError(result.error ?? "Failed."); return; }
      setSuccess("Subscription updated.");
      router.refresh();
    });
  };

  const subBadge = (status: string) => {
    if (status === "active") return <Badge variant="success">Active</Badge>;
    if (status === "lapsed") return <Badge variant="destructive">Lapsed</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-fraunces font-bold mb-1">User Management</h1>
          <p className="text-muted">Manage subscribers and view their activity.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
          {success}
        </div>
      )}

      <div className="flex items-center bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search users..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-4 text-sm text-muted">{filtered.length} users</div>
      </div>

      <div className="space-y-2">
        {filtered.map((u) => {
          const subscription = sub(u);
          const isExpanded = expanded === u.id;

          return (
            <div key={u.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              {/* Header Row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg/40 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : u.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-accent font-bold text-sm">
                      {u.full_name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.full_name}</div>
                    <div className="text-sm text-muted truncate">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {u.role === "admin" && (
                    <Badge className="bg-accent-warm text-black">Admin</Badge>
                  )}
                  {subscription ? (
                    subBadge(subscription.status)
                  ) : (
                    <Badge variant="secondary">No Sub</Badge>
                  )}
                  <span className="text-sm text-muted hidden sm:block capitalize">
                    {subscription?.plan ?? "—"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-6 bg-bg/30">
                  {/* Subscription Management */}
                  {subscription && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                        Subscription
                      </h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-sm">
                          Plan: <strong className="capitalize">{subscription.plan}</strong>
                        </span>
                        <span className="text-sm text-muted">|</span>
                        <span className="text-sm">
                          Status:{" "}
                          <strong>{subscription.status}</strong>
                        </span>
                        <span className="text-sm text-muted">|</span>
                        <span className="text-sm">
                          Charity contribution:{" "}
                          <strong>{subscription.charity_contribution_pct ?? 10}%</strong>
                        </span>
                        {subscription.current_period_end && (
                          <>
                            <span className="text-sm text-muted">|</span>
                            <span className="text-sm">
                              Renewal:{" "}
                              <strong>
                                {new Date(subscription.current_period_end).toLocaleDateString("en-GB")}
                              </strong>
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {subscription.status !== "active" && (
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-black"
                            disabled={isPending}
                            onClick={() => handleSubStatus(subscription.id, "active")}
                          >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Set Active
                          </Button>
                        )}
                        {subscription.status !== "lapsed" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleSubStatus(subscription.id, "lapsed")}
                          >
                            Set Lapsed
                          </Button>
                        )}
                        {subscription.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleSubStatus(subscription.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scores Management */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                      Scores ({u.scores?.length ?? 0} / 5)
                    </h3>
                    {u.scores && u.scores.length > 0 ? (
                      <div className="space-y-2">
                        {u.scores.map((score) => (
                          <div
                            key={score.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border bg-surface"
                          >
                            {editingScoreId === score.id ? (
                              <>
                                <Input
                                  type="number"
                                  value={scoreEdit.score}
                                  onChange={(e) =>
                                    setScoreEdit((p) => ({ ...p, score: e.target.value }))
                                  }
                                  className="w-24 h-8"
                                  min={1}
                                  max={45}
                                />
                                <Input
                                  type="date"
                                  value={scoreEdit.date}
                                  onChange={(e) =>
                                    setScoreEdit((p) => ({ ...p, date: e.target.value }))
                                  }
                                  className="w-40 h-8"
                                />
                                <Button
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  disabled={isPending}
                                  onClick={() => handleScoreSave(score.id)}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setEditingScoreId(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="font-mono font-bold text-accent">
                                  {score.score} pts
                                </span>
                                <span className="text-sm text-muted flex-1">
                                  {new Date(score.score_date).toLocaleDateString("en-GB")}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted hover:text-text"
                                  onClick={() => handleScoreEdit(score)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-danger hover:bg-danger/10"
                                  disabled={isPending}
                                  onClick={() => handleScoreDelete(score.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">No scores logged.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted">No users found.</div>
        )}
      </div>
    </div>
  );
}
