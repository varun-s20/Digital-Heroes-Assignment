"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Draw {
  id: string;
  draw_month: string;
  status: 'pending' | 'simulated' | 'published';
  draw_mode: string | null;
  drawn_numbers: number[] | null;
  active_subscriber_count: number | null;
  prize_pool_total: number | null;
  tier_5_pool: number | null;
  tier_4_pool: number | null;
  tier_3_pool: number | null;
  simulation_results: any;
  jackpot_carry_amount: number | null;
  jackpot_carried_over: boolean;
  published_at: string | null;
}

interface Props {
  draws: Draw[];
  activeSubscriberCount: number;
}

type DrawMode = 'algorithmic' | 'random';

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function AdminDrawsClient({ draws, activeSubscriberCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<DrawMode>('algorithmic');
  const [selectedDrawId, setSelectedDrawId] = useState<string>(
    draws.find(d => d.status === 'pending' || d.status === 'simulated')?.id ?? ''
  );
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [simResults, setSimResults] = useState<any>(
    draws.find(d => d.id === selectedDrawId)?.simulation_results ?? null
  );

  const selectedDraw = draws.find(d => d.id === selectedDrawId);

  const handleCreateDraw = () => {
    if (!newDate) { setError('Please select a date.'); return; }
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/admin/draws/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawMonth: newDate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.refresh();
    });
  };

  const handleSimulate = () => {
    if (!selectedDrawId) { setError('Select a pending draw first.'); return; }
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/admin/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawId: selectedDrawId, mode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSimResults(data.simulation);
      router.refresh();
    });
  };

  const handlePublish = () => {
    if (!selectedDrawId) { setError('Select a simulated draw to publish.'); return; }
    if (!window.confirm('Are you sure you want to publish this draw? This action cannot be undone.')) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/admin/draws/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawId: selectedDrawId, mode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSimResults(null);
      router.refresh();
    });
  };

  const pendingDraws = draws.filter(d => d.status !== 'published');
  const publishedDraws = draws.filter(d => d.status === 'published');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-1">Draw Configuration</h1>
        <p className="text-muted">Run simulations and publish official monthly draws.</p>
        <div className="mt-2 text-sm text-muted">
          Active subscribers: <strong className="text-text">{activeSubscriberCount}</strong>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create New Draw */}
      <Card className="bg-[#050608] border-border">
        <CardHeader>
          <CardTitle>Create New Draw</CardTitle>
          <CardDescription>Schedule a pending draw for a future date.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="newDate">Draw Date</Label>
            <Input
              id="newDate"
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-48 [color-scheme:dark]"
            />
          </div>
          <Button onClick={handleCreateDraw} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Draw
          </Button>
        </CardContent>
      </Card>

      {/* Configure & Run */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#050608] border-border">
          <CardHeader>
            <CardTitle>Configure Draw</CardTitle>
            <CardDescription>Select a pending/simulated draw to run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Draw</Label>
              <select
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text"
                value={selectedDrawId}
                onChange={e => {
                  setSelectedDrawId(e.target.value);
                  const d = draws.find(x => x.id === e.target.value);
                  setSimResults(d?.simulation_results ?? null);
                }}
              >
                <option value="">— Select —</option>
                {pendingDraws.map(d => (
                  <option key={d.id} value={d.id}>
                    {new Date(d.draw_month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', day: 'numeric' })} ({d.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Draw Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'algorithmic' ? 'default' : 'outline'}
                  className={mode === 'algorithmic' ? 'bg-accent-warm text-black hover:bg-accent-warm/90' : ''}
                  onClick={() => setMode('algorithmic')}
                  type="button"
                >
                  Algorithmic (Score-Weighted)
                </Button>
                <Button
                  variant={mode === 'random' ? 'default' : 'outline'}
                  className={mode === 'random' ? 'bg-accent text-bg hover:bg-accent/90' : ''}
                  onClick={() => setMode('random')}
                  type="button"
                >
                  Pure Random
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <Button
                onClick={handleSimulate}
                disabled={isPending || !selectedDrawId || selectedDraw?.status === 'published'}
                className="flex-1 h-12"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Run Simulation
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPending || !selectedDrawId || selectedDraw?.status !== 'simulated'}
                className="flex-1 h-12 bg-success hover:bg-success/90 text-black"
              >
                Publish Draw
              </Button>
            </div>

            {selectedDraw?.status !== 'simulated' && selectedDrawId && (
              <p className="text-xs text-muted text-center">Run simulation first before publishing.</p>
            )}
          </CardContent>
        </Card>

        {/* Simulation Results */}
        {simResults ? (
          <Card className="bg-surface border-accent-warm/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-accent-warm">Simulation Results</CardTitle>
              <CardDescription>Preview before publishing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 border border-dashed border-border rounded-xl">
                <div className="text-sm text-muted mb-4">Numbers Drawn</div>
                <div className="flex justify-center gap-3">
                  {(simResults.drawnNumbers || []).map((n: number) => (
                    <div key={n} className="w-12 h-12 rounded-full bg-accent-warm text-black font-bold font-mono flex items-center justify-center text-xl">
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Match 5 Winners: <strong className="text-text">{simResults.tier5Winners?.length ?? 0}</strong>{simResults.jackpotRollover ? ' (Rollover)' : ''}</span>
                  <span className="text-muted">₹{simResults.tier5PerWinner ?? 0} each</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Match 4 Winners: <strong className="text-text">{simResults.tier4Winners?.length ?? 0}</strong></span>
                  <span className="text-muted">₹{simResults.tier4PerWinner ?? 0} each</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Match 3 Winners: <strong className="text-text">{simResults.tier3Winners?.length ?? 0}</strong></span>
                  <span className="text-muted">₹{simResults.tier3PerWinner ?? 0} each</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                  <span>Total Prize Pool</span>
                  <span className="text-accent">₹{simResults.prizePoolTotal?.toLocaleString() ?? 0}</span>
                </div>
                {simResults.jackpotRollover && (
                  <div className="text-accent-warm text-xs text-center">
                    ⚠️ No Tier 5 winner — ₹{simResults.jackpotRolloverAmount?.toFixed(2)} rolled over to next draw
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#050608] border-border flex items-center justify-center min-h-[300px] border-dashed">
            <div className="text-center text-muted">
              <p>Run a simulation to preview results before publishing.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Past Draws Table */}
      <Card className="bg-[#050608] border-border">
        <CardHeader>
          <CardTitle>Published Draws</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-left">
                  <th className="pb-3 font-medium">Month</th>
                  <th className="pb-3 font-medium">Numbers</th>
                  <th className="pb-3 font-medium">Mode</th>
                  <th className="pb-3 font-medium">Subscribers</th>
                  <th className="pb-3 font-medium">Prize Pool</th>
                  <th className="pb-3 font-medium">Rollover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publishedDraws.map(d => (
                  <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3">{formatMonth(d.draw_month)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {(d.drawn_numbers ?? []).map(n => (
                          <span key={n} className="font-mono text-xs border border-border px-1.5 py-0.5 rounded">{n}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 capitalize">{d.draw_mode ?? '—'}</td>
                    <td className="py-3">{d.active_subscriber_count ?? '—'}</td>
                    <td className="py-3 font-mono font-medium text-accent">₹{d.prize_pool_total?.toLocaleString() ?? '—'}</td>
                    <td className="py-3">
                      {d.jackpot_carried_over
                        ? <Badge className="bg-accent-warm text-black">Rollover ₹{d.jackpot_carry_amount?.toFixed(2)}</Badge>
                        : <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Won</Badge>
                      }
                    </td>
                  </tr>
                ))}
                {publishedDraws.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted">No published draws yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
