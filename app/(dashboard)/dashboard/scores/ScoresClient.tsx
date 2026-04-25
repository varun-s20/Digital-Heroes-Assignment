"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { Info, Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addScore, deleteScore, editScore } from "@/app/actions/scores";
import { useRouter } from "next/navigation";

const scoreSchema = z.object({
  score: z.coerce.number().int().min(1, "Score must be at least 1").max(45, "Score cannot exceed 45"),
  date: z.string().min(1, "Date is required"),
});

type ScoreForm = z.infer<typeof scoreSchema>;

interface Score { id: string; score: number; score_date: string }

interface Props {
  userId: string;
  initialScores: Score[];
}

export default function ScoresClient({ userId, initialScores }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ScoreForm>({
    resolver: zodResolver(scoreSchema) as any,
    defaultValues: { 
      score: 0, 
      date: new Date().toISOString().split("T")[0] 
    },
  });

  const editForm = useForm<ScoreForm>({ 
    resolver: zodResolver(scoreSchema) as any
  });

  const onSubmit = async (data: ScoreForm) => {
    setServerError(null);
    startTransition(async () => {
      const result = await addScore(userId, data.score, data.date);
      if (!result.success) {
        setServerError(result.error ?? "Failed to add score.");
      } else {
        reset();
        setShowForm(false);
        router.refresh();
      }
    });
  };

  const onDelete = async (scoreId: string) => {
    startTransition(async () => {
      const result = await deleteScore(scoreId, userId);
      if (result.success) router.refresh();
    });
  };

  const onEditSubmit = async (data: ScoreForm) => {
    if (!editingId) return;
    startTransition(async () => {
      const result = await editScore(editingId, userId, data.score, data.date);
      if (!result.success) {
        setServerError(result.error ?? "Failed to update score.");
      } else {
        setEditingId(null);
        router.refresh();
      }
    });
  };

  const startEdit = (score: Score) => {
    setEditingId(score.id);
    editForm.reset({ score: score.score, date: score.score_date });
  };

  const isAtMax = initialScores.length >= 5;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-fraunces font-bold mb-2">Score History</h1>
          <p className="text-muted">Manage your stableford scores. Only the most recent 5 scores are active.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="shadow-[0_0_15px_rgba(0,229,153,0.15)]">
            <Plus className="mr-2 h-4 w-4" /> Add New Score
          </Button>
        )}
      </div>

      {isAtMax && (
        <div className="bg-accent-warm/10 border border-accent-warm/30 rounded-xl p-4 flex gap-4 items-start">
          <Info className="h-5 w-5 text-accent-warm shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-accent-warm">Maximum Active Scores Reached</h4>
            <p className="text-sm text-muted mt-1">
              You currently have 5 active scores. Adding a new score will replace your <strong>oldest</strong> active score in the draw pool.
            </p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      )}

      {showForm && (
        <Card className="bg-surface border-border border-l-4 border-l-accent shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Log New Score</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Round</Label>
                  <Input id="date" type="date" {...register("date")} className={errors.date ? "border-danger" : ""} />
                  {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score">Stableford Score (1-45)</Label>
                  <Input id="score" type="number" placeholder="e.g. 36" {...register("score")} className={errors.score ? "border-danger" : ""} />
                  {errors.score && <p className="text-xs text-danger">{errors.score.message}</p>}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Score
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setServerError(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {initialScores.map((score, index) => (
          <div key={score.id} className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between group transition-colors hover:border-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-bl-lg">
              Active in Next Draw
            </div>

            {editingId === score.id ? (
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-wrap gap-4 items-center w-full pr-24">
                <Input type="date" {...editForm.register("date")} className="w-40" />
                <Input type="number" {...editForm.register("score")} className="w-24" />
                <Button type="submit" size="sm" disabled={isPending}><Check className="h-4 w-4" /></Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex h-16 w-16 rounded-full bg-bg border border-border items-center justify-center">
                    <span className="text-xl font-mono text-muted">#{initialScores.length - index}</span>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-text mb-1">Stableford Round</div>
                    <div className="text-sm text-muted">{formatDate(score.score_date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                  <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-accent">{score.score}</div>
                    <div className="text-xs text-muted uppercase tracking-widest">Points</div>
                  </div>
                  <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(score)} className="text-muted hover:text-text">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(score.id)} disabled={isPending} className="text-danger hover:bg-danger/10 hover:text-danger">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {initialScores.length === 0 && (
          <div className="text-center py-20 text-muted">
            <p className="text-lg">No scores logged yet.</p>
            <p className="text-sm mt-2">Add your first Stableford score to join the draw!</p>
          </div>
        )}
      </div>
    </div>
  );
}
