'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

async function checkAdmin(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { ok: false, error: 'Unauthorized.' }
  return { ok: true }
}

export async function adminEditScore(
  scoreId: string,
  newScore: number,
  newDate: string
): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  if (!Number.isInteger(newScore)) return { success: false, error: 'Score must be a whole number.' }
  if (newScore < 1 || newScore > 45) return { success: false, error: 'Score must be between 1 and 45.' }

  const today = new Date().toISOString().split('T')[0]
  if (newDate > today) return { success: false, error: 'Score date cannot be in the future.' }

  const adminSupabase = await createAdminClient()

  // Get the score to find which user it belongs to (for duplicate check)
  const { data: existing } = await adminSupabase
    .from('scores')
    .select('user_id')
    .eq('id', scoreId)
    .single()

  if (!existing) return { success: false, error: 'Score not found.' }

  // Check date conflict (excluding current record)
  const { data: conflict } = await adminSupabase
    .from('scores')
    .select('id')
    .eq('user_id', existing.user_id)
    .eq('score_date', newDate)
    .neq('id', scoreId)
    .single()

  if (conflict) return { success: false, error: 'Another score already exists for this date.' }

  const { error: dbError } = await adminSupabase
    .from('scores')
    .update({ score: newScore, score_date: newDate })
    .eq('id', scoreId)

  if (dbError) return { success: false, error: dbError.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminDeleteScore(scoreId: string): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('scores')
    .delete()
    .eq('id', scoreId)

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminUpdateSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'lapsed' | 'cancelled'
): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('subscriptions')
    .update({ status })
    .eq('id', subscriptionId)

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/users')
  return { success: true }
}
