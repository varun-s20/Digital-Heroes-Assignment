"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Winning {
  id: string;
  tier: string;
  amount: number;
  status: string;
  proof_url?: string;
  proof_submitted_at?: string;
  rejection_reason?: string;
  draws: { draw_month: string; drawn_numbers: number[] } | null;
}

interface Props {
  userId: string;
  winnings: Winning[];
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function WinningsClient({ userId, winnings }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalWon = winnings
    .filter(w => ['verified', 'paid'].includes(w.status))
    .reduce((acc, w) => acc + w.amount, 0);

  const pendingProof = winnings.filter(w => w.status === 'pending' || w.status === 'rejected');

  const handleProofUpload = async (winningId: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are accepted (PNG, JPG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5MB.');
      return;
    }

    setUploadError(null);
    setUploading(winningId);
    const supabase = createClient();
    const path = `${userId}/${winningId}/${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from('winner-proofs')
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setUploadError(uploadErr.message);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(path);

    const { error: updateErr } = await supabase
      .from('winnings')
      .update({
        proof_url: publicUrl,
        proof_submitted_at: new Date().toISOString(),
        status: 'proof_submitted',
      })
      .eq('id', winningId);

    if (updateErr) {
      setUploadError(updateErr.message);
      setUploading(null);
      return;
    }

    // Notify admin via server action
    await fetch('/api/admin/winners/notify-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winningsId: winningId }),
    }).catch(() => {});

    setUploading(null);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-fraunces font-bold mb-2">My Winnings</h1>
        <p className="text-muted">Overview of your cash prizes and payout status.</p>
      </div>

      <div className="bg-gradient-to-br from-surface to-bg border border-border p-8 rounded-3xl text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
        <div>
          <div className="text-sm font-medium text-muted uppercase tracking-widest mb-2">Total Verified Winnings</div>
          <div className="text-5xl font-mono font-bold text-accent">₹{totalWon.toLocaleString()}</div>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {uploadError}
        </div>
      )}

      {pendingProof.map(w => (
        <Card key={w.id} className={`border ${w.status === 'rejected' ? 'border-danger bg-danger/5' : 'border-accent-warm bg-accent-warm/5'}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${w.status === 'rejected' ? 'text-danger' : 'text-accent-warm'}`} />
              <CardTitle className="text-lg">
                {w.status === 'rejected' ? 'Proof Rejected — Resubmit Required' : 'Action Required: Submit Proof'}
              </CardTitle>
            </div>
            <CardDescription className="text-text">
              Tier: <strong>{w.tier.replace('_', ' ').toUpperCase()}</strong> — Prize: <strong className="text-accent">₹{w.amount.toLocaleString()}</strong>
              {w.status === 'rejected' && w.rejection_reason && (
                <div className="mt-2 text-danger text-sm">Reason: {w.rejection_reason}</div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor={`proof-${w.id}`} className="cursor-pointer">
              <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-bg/50 hover:border-accent/50 transition-colors">
                {uploading === w.id ? (
                  <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
                ) : (
                  <Upload className="h-8 w-8 text-muted mb-4" />
                )}
                <h4 className="font-semibold mb-1">Upload Proof Screenshot</h4>
                <p className="text-sm text-muted mb-4 max-w-sm">Max 5MB · Images only (PNG, JPG, etc.)</p>
                <Button variant="outline" className="bg-surface" type="button" disabled={uploading === w.id}>
                  {uploading === w.id ? 'Uploading...' : 'Select File'}
                </Button>
              </div>
              <input
                id={`proof-${w.id}`}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleProofUpload(w.id, file);
                }}
              />
            </label>
          </CardContent>
        </Card>
      ))}

      {winnings.some(w => w.status === 'proof_submitted') && (
        <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4">
          <CheckCircle className="h-5 w-5 text-accent shrink-0" />
          <p className="text-sm text-muted">Your proof has been submitted and is awaiting admin review.</p>
        </div>
      )}

      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Draw Month</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winnings.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">
                    {w.draws ? formatMonth(w.draws.draw_month) : '—'}
                  </TableCell>
                  <TableCell>{w.tier.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell className="font-mono font-bold text-text">₹{w.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {w.status === 'paid' && <Badge variant="success">Paid Out</Badge>}
                    {w.status === 'verified' && <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Verified</Badge>}
                    {w.status === 'proof_submitted' && <Badge className="bg-purple-500 text-white">Under Review</Badge>}
                    {w.status === 'pending' && <Badge className="bg-accent-warm text-black hover:bg-accent-warm/80">Action Required</Badge>}
                    {w.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {winnings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted">
                    You haven&apos;t won any prizes yet. Keep logging those scores!
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
