import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendProofSubmittedAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { winningsId } = await req.json()
  if (!winningsId) return NextResponse.json({ error: 'winningsId required' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data: winning } = await supabase
    .from('winnings')
    .select(`*, profiles!winnings_user_id_fkey(full_name)`)
    .eq('id', winningsId)
    .single()

  if (!winning) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const name = (winning as any).profiles?.full_name ?? 'Unknown'
  await sendProofSubmittedAdminEmail(name, winning.tier, winning.amount, winningsId)

  return NextResponse.json({ success: true })
}
