import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  computeDrawResult,
  SubscriberSnapshot,
} from '@/lib/draw-engine'

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createAdminClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

async function runDraw(req: NextRequest, isSimulation: boolean) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await verifyAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { drawId, mode } = await req.json() as { drawId: string; mode: 'random' | 'algorithmic' }
  if (!drawId || !mode) return NextResponse.json({ error: 'drawId and mode are required' }, { status: 400 })

  // Fetch draw record
  const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found.' }, { status: 404 })

  // For publish, must have been simulated first
  if (!isSimulation && draw.status !== 'simulated') {
    return NextResponse.json({ error: 'Draw must be simulated before publishing.' }, { status: 400 })
  }

  // Fetch active subscribers with scores
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (!activeSubs || activeSubs.length === 0) {
    return NextResponse.json({ error: 'No active subscribers found.' }, { status: 400 })
  }

  // Fetch scores for each subscriber
  const subscribers: SubscriberSnapshot[] = []
  for (const sub of activeSubs) {
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', sub.user_id)
      .order('score_date', { ascending: false })
      .limit(5)
    subscribers.push({
      userId: sub.user_id,
      scores: (scores ?? []).map(s => s.score),
    })
  }

  // Generate drawn numbers
  const allScores = subscribers.flatMap(s => s.scores)
  const drawnNumbers = mode === 'algorithmic'
    ? generateAlgorithmicDraw(allScores)
    : generateRandomDraw()

  const poolRatio = parseFloat(process.env.SUBSCRIPTION_POOL_RATIO || '0.70')
  const planAmount = 9.99 // Monthly base; simplified — could be weighted by plan type
  const jackpotCarryAmount = draw.jackpot_carry_amount || 0

  const result = computeDrawResult(drawnNumbers, subscribers, poolRatio, planAmount, jackpotCarryAmount)

  if (isSimulation) {
    await supabase.from('draws').update({
      draw_mode: mode,
      drawn_numbers: drawnNumbers,
      active_subscriber_count: subscribers.length,
      prize_pool_total: result.prizePoolTotal,
      tier_5_pool: result.tier5Pool,
      tier_4_pool: result.tier4Pool,
      tier_3_pool: result.tier3Pool,
      simulation_results: result as unknown as Record<string, unknown>,
      status: 'simulated',
    }).eq('id', drawId)

    return NextResponse.json({ success: true, simulation: result })
  }

  // --- OFFICIAL PUBLISH ---

  // Insert draw_entries for all subscribers
  const entries = result.entries.map(e => ({
    draw_id: drawId,
    user_id: e.userId,
    scores_snapshot: e.scoresSnapshot,
    match_count: e.matchCount,
    tier_matched: e.tierMatched,
  }))

  const { data: insertedEntries } = await supabase.from('draw_entries').insert(entries).select()

  // Insert winnings for winners
  const winnerEntries = (insertedEntries ?? []).filter(e => e.tier_matched)
  for (const entry of winnerEntries) {
    let amount = 0
    if (entry.tier_matched === 'tier_5') amount = result.tier5PerWinner
    else if (entry.tier_matched === 'tier_4') amount = result.tier4PerWinner
    else if (entry.tier_matched === 'tier_3') amount = result.tier3PerWinner

    await supabase.from('winnings').insert({
      draw_entry_id: entry.id,
      user_id: entry.user_id,
      draw_id: drawId,
      tier: entry.tier_matched,
      amount,
      status: 'pending',
    })
  }

  // Update draw status
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

  // Handle jackpot rollover to next draw
  if (result.jackpotRollover) {
    // Find next pending draw and carry over
    const { data: nextDraw } = await supabase
      .from('draws')
      .select('id, jackpot_carry_amount')
      .eq('status', 'pending')
      .order('draw_month', { ascending: true })
      .limit(1)
      .single()

    if (nextDraw) {
      await supabase.from('draws').update({
        jackpot_carry_amount: (nextDraw.jackpot_carry_amount || 0) + result.jackpotRolloverAmount,
      }).eq('id', nextDraw.id)
    }
  }

  // Send result emails (async, don't block response)
  Promise.all(
    subscribers.map(async sub => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sub.userId)
        .single()

      if (!profile) return

      const entry = result.entries.find(e => e.userId === sub.userId)
      if (!entry) return

      await import('@/lib/email').then(({ sendDrawResultsEmail, sendWinnerNotificationEmail }) => {
        const tier = entry.tierMatched
        const amount = tier === 'tier_5' ? result.tier5PerWinner
          : tier === 'tier_4' ? result.tier4PerWinner
          : tier === 'tier_3' ? result.tier3PerWinner : null

        sendDrawResultsEmail(
          profile.email,
          profile.full_name,
          drawnNumbers,
          entry.scoresSnapshot,
          entry.matchCount,
          tier,
          amount
        )

        if (tier && amount) {
          sendWinnerNotificationEmail(profile.email, profile.full_name, tier, amount)
        }
      })
    })
  ).catch(err => console.error('[Draw] Email send error:', err))

  return NextResponse.json({ success: true, result })
}

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  // This route handles both /simulate and /publish based on URL
  const url = req.nextUrl.pathname
  const isSimulation = url.includes('/simulate')
  return runDraw(req, isSimulation)
}
