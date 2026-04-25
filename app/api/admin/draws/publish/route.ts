import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  computeDrawResult,
  SubscriberSnapshot,
} from '@/lib/draw-engine'
import {
  sendDrawResultsEmail,
  sendWinnerNotificationEmail,
} from '@/lib/email'

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createAdminClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await verifyAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { drawId, mode } = await req.json() as { drawId: string; mode: 'random' | 'algorithmic' }
  if (!drawId || !mode) return NextResponse.json({ error: 'drawId and mode are required' }, { status: 400 })

  const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found.' }, { status: 404 })

  if (draw.status !== 'simulated') {
    return NextResponse.json({ error: 'Draw must be simulated before publishing.' }, { status: 400 })
  }

  const { data: activeSubs } = await supabase
    .from('subscriptions').select('user_id').eq('status', 'active')

  if (!activeSubs || activeSubs.length === 0)
    return NextResponse.json({ error: 'No active subscribers.' }, { status: 400 })

  const subscribers: SubscriberSnapshot[] = []
  for (const sub of activeSubs) {
    const { data: scores } = await supabase
      .from('scores').select('score').eq('user_id', sub.user_id)
      .order('score_date', { ascending: false }).limit(5)
    subscribers.push({ userId: sub.user_id, scores: (scores ?? []).map(s => s.score) })
  }

  const allScores = subscribers.flatMap(s => s.scores)
  const drawnNumbers = mode === 'algorithmic' ? generateAlgorithmicDraw(allScores) : generateRandomDraw()

  const poolRatio = parseFloat(process.env.SUBSCRIPTION_POOL_RATIO || '0.70')
  const result = computeDrawResult(drawnNumbers, subscribers, poolRatio, 9.99, draw.jackpot_carry_amount || 0)

  // Insert draw_entries
  const entries = result.entries.map(e => ({
    draw_id: drawId,
    user_id: e.userId,
    scores_snapshot: e.scoresSnapshot,
    match_count: e.matchCount,
    tier_matched: e.tierMatched,
  }))
  const { data: insertedEntries } = await supabase.from('draw_entries').insert(entries).select()

  // Insert winnings
  for (const entry of (insertedEntries ?? []).filter(e => e.tier_matched)) {
    const amount = entry.tier_matched === 'tier_5' ? result.tier5PerWinner
      : entry.tier_matched === 'tier_4' ? result.tier4PerWinner
      : result.tier3PerWinner

    await supabase.from('winnings').insert({
      draw_entry_id: entry.id,
      user_id: entry.user_id,
      draw_id: drawId,
      tier: entry.tier_matched,
      amount,
      status: 'pending',
    })
  }

  // Update draw
  await supabase.from('draws').update({
    draw_mode: mode,
    drawn_numbers: drawnNumbers,
    active_subscriber_count: subscribers.length,
    prize_pool_total: result.prizePoolTotal,
    tier_5_pool: result.tier5Pool,
    tier_4_pool: result.tier4Pool,
    tier_3_pool: result.tier3Pool,
    jackpot_carried_over: result.jackpotRollover,
    jackpot_carry_amount: result.jackpotRolloverAmount,
    status: 'published',
    published_at: new Date().toISOString(),
  }).eq('id', drawId)

  // Handle jackpot rollover to next pending draw
  if (result.jackpotRollover) {
    const { data: nextDraw } = await supabase
      .from('draws').select('id, jackpot_carry_amount')
      .eq('status', 'pending').order('draw_month', { ascending: true }).limit(1).single()
    if (nextDraw) {
      await supabase.from('draws').update({
        jackpot_carry_amount: (nextDraw.jackpot_carry_amount || 0) + result.jackpotRolloverAmount,
      }).eq('id', nextDraw.id)
    }
  }

  // Send emails (fire and forget)
  Promise.all(subscribers.map(async sub => {
    const { data: profile } = await supabase
      .from('profiles').select('email, full_name').eq('id', sub.userId).single()
    if (!profile) return
    const entry = result.entries.find(e => e.userId === sub.userId)
    if (!entry) return
    const tier = entry.tierMatched
    const amount = tier === 'tier_5' ? result.tier5PerWinner
      : tier === 'tier_4' ? result.tier4PerWinner
      : tier === 'tier_3' ? result.tier3PerWinner : null

    await sendDrawResultsEmail(profile.email, profile.full_name, drawnNumbers, entry.scoresSnapshot, entry.matchCount, tier, amount)
    if (tier && amount) {
      await sendWinnerNotificationEmail(profile.email, profile.full_name, tier, amount)
    }
  })).catch(err => console.error('[Publish] Email error:', err))

  return NextResponse.json({ success: true, result })
}
