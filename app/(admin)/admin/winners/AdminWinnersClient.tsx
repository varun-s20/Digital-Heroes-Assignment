"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, XCircle, Loader2, AlertCircle, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface Winning {
  id: string;
  tier: string;
  amount: number;
  status: string;
  proof_url?: string;
  proof_submitted_at?: string;
  rejection_reason?: string;
  profiles: { full_name: string; email: string } | null;
  draws: { draw_month: string } | null;
}

interface Props {
  winnings: Winning[];
}

function formatMonth(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function AdminWinnersClient({ winnings }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pending = winnings.filter(w => w.status === 'proof_submitted');
  const history = winnings.filter(w => w.status !== 'proof_submitted');

  const adminAction = async (endpoint: string, body: object) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setRejecting(null);
      setRejectionReason('');
      router.refresh();
    });
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-1">Winner Verifications</h1>
        <p className="text-muted">Review proof submissions for prize payouts.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Pending Proof Reviews */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-fraunces text-accent-warm flex items-center gap-2">
          Action Required
          <Badge className="bg-accent-warm text-black">{pending.length}</Badge>
        </h2>

        {pending.length === 0 && (
          <p className="text-muted text-sm">No pending proof submissions.</p>
        )}

        {pending.map(w => (
          <div key={w.id} className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap gap-6 items-start justify-between">
              <div>
                <div className="font-semibold">{w.profiles?.full_name ?? 'Unknown'}</div>
                <div className="text-sm text-muted">{w.profiles?.email}</div>
                <div className="text-xs text-muted mt-1">{w.draws ? formatMonth(w.draws.draw_month) : '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-accent">₹{w.amount.toLocaleString()}</div>
                <div className="text-xs text-muted">{w.tier.replace('_', ' ').toUpperCase()}</div>
              </div>
            </div>

            {w.proof_url && (
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="flex items-center justify-between px-4 py-2 bg-bg border-b border-border">
                  <span className="text-sm text-muted">Proof Document</span>
                  <a href={w.proof_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 text-accent hover:text-accent/80">
                      <ExternalLink className="h-3 w-3 mr-1" /> Open
                    </Button>
                  </a>
                </div>
                <img
                  src={w.proof_url}
                  alt="Winner proof"
                  className="w-full max-h-64 object-contain bg-bg/50"
                />
              </div>
            )}

            {rejecting === w.id ? (
              <div className="space-y-3 pt-2 border-t border-border">
                <textarea
                  className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text resize-none"
                  rows={3}
                  placeholder="Reason for rejection..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!rejectionReason || isPending}
                    onClick={() => adminAction('/api/admin/winners/reject', { winningsId: w.id, rejectionReason })}
                  >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Confirm Rejection
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 pt-2 border-t border-border">
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 text-black"
                  disabled={isPending}
                  onClick={() => adminAction('/api/admin/winners/verify', { winningsId: w.id })}
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
                <Button size="sm" variant="destructive" disabled={isPending} onClick={() => setRejecting(w.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-fraunces">Verification History</h2>
        <div className="overflow-x-auto bg-surface border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-left">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Draw Month</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map(w => (
                <tr key={w.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{w.profiles?.full_name}</div>
                    <div className="text-xs text-muted">{w.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3">{w.draws ? formatMonth(w.draws.draw_month) : '—'}</td>
                  <td className="px-4 py-3">{w.tier.replace('_', ' ').toUpperCase()}</td>
                  <td className="px-4 py-3 font-mono font-bold text-accent">₹{w.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {w.status === 'paid' && <Badge variant="success">Paid</Badge>}
                    {w.status === 'verified' && <Badge className="bg-blue-500 text-white">Verified</Badge>}
                    {w.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                    {w.status === 'pending' && <Badge variant="secondary">Pending Proof</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    {w.status === 'verified' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => adminAction('/api/admin/winners/mark-paid', { winningsId: w.id })}
                      >
                        <DollarSign className="h-3 w-3 mr-1" /> Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted">No verification history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
