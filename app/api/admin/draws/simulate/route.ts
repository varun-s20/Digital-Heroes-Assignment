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
