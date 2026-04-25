import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  computeDrawResult,
} from '@/lib/draw-engine'
import {
  sendDrawResultsEmail,
  sendWinnerNotificationEmail,
} from '@/lib/email'

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createAdminClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

// POST /api/admin/draws/create
export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await verifyAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { drawMonth } = await req.json() // ISO date string, e.g. '2025-05-01'
  if (!drawMonth) return NextResponse.json({ error: 'drawMonth is required' }, { status: 400 })

  const { data: existing } = await supabase.from('draws').select('id').eq('draw_month', drawMonth).single()
  if (existing) return NextResponse.json({ error: 'A draw already exists for this month.' }, { status: 400 })

  const { data, error } = await supabase.from('draws').insert({
    draw_month: drawMonth,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
