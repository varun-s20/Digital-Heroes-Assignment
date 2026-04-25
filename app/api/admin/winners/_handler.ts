import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendWinnerVerifiedEmail,
  sendWinnerRejectedEmail,
} from '@/lib/email'

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createAdminClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

// POST /api/admin/winners/verify
export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await verifyAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = req.nextUrl.pathname
  const { winningsId, rejectionReason } = await req.json()

  if (!winningsId) return NextResponse.json({ error: 'winningsId required' }, { status: 400 })

  const { data: winning } = await supabase
    .from('winnings')
    .select('*, profiles!winnings_user_id_fkey(email, full_name)')
    .eq('id', winningsId)
    .single()

  if (!winning) return NextResponse.json({ error: 'Winning not found' }, { status: 404 })

  if (url.includes('/verify')) {
    const { error } = await supabase.from('winnings').update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: user.id,
    }).eq('id', winningsId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const profile = (winning as any).profiles
    if (profile) {
      await sendWinnerVerifiedEmail(profile.email, profile.full_name, winning.amount)
    }
    return NextResponse.json({ success: true })

  } else if (url.includes('/reject')) {
    if (!rejectionReason) return NextResponse.json({ error: 'rejectionReason required' }, { status: 400 })
    const { error } = await supabase.from('winnings').update({
      status: 'rejected',
      rejection_reason: rejectionReason,
    }).eq('id', winningsId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const profile = (winning as any).profiles
    if (profile) {
      await sendWinnerRejectedEmail(profile.email, profile.full_name, rejectionReason)
    }
    return NextResponse.json({ success: true })

  } else if (url.includes('/mark-paid')) {
    const { error } = await supabase.from('winnings').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    }).eq('id', winningsId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
