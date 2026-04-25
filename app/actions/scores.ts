'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

export async function getScores(userId: string): Promise<ActionResult<{ id: string; score: number; score_date: string }[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function addScore(
  userId: string,
  score: number,
  scoreDate: string
): Promise<ActionResult> {
  // Validate score is integer
  if (!Number.isInteger(score)) return { success: false, error: 'Score must be a whole number (no decimals).' }
  if (score < 1 || score > 45) return { success: false, error: 'Score must be between 1 and 45.' }

  // Validate date not in future
  const today = new Date().toISOString().split('T')[0]
  if (scoreDate > today) return { success: false, error: 'Score date cannot be in the future.' }

  const supabase = await createClient()

  // Check for duplicate date
  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .eq('score_date', scoreDate)
    .single()

  if (existing) return { success: false, error: 'A score already exists for this date. Please choose a different date.' }

  // Count current scores
  const { count } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) >= 5) {
    // Find oldest score and delete it (rolling window)
    const { data: oldest } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .order('score_date', { ascending: true })
      .limit(1)
      .single()

    if (oldest) {
      await supabase.from('scores').delete().eq('id', oldest.id)
    }
  }

  const { error } = await supabase
    .from('scores')
    .insert({ user_id: userId, score, score_date: scoreDate })

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function editScore(
  scoreId: string,
  userId: string,
  newScore: number,
  newDate: string
): Promise<ActionResult> {
  if (!Number.isInteger(newScore)) return { success: false, error: 'Score must be a whole number (no decimals).' }
  if (newScore < 1 || newScore > 45) return { success: false, error: 'Score must be between 1 and 45.' }

  const today = new Date().toISOString().split('T')[0]
  if (newDate > today) return { success: false, error: 'Score date cannot be in the future.' }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('scores')
    .select('user_id')
    .eq('id', scoreId)
    .single()

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: 'Score not found or access denied.' }
  }

  // Check date conflict (excluding current record)
  const { data: conflict } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .eq('score_date', newDate)
    .neq('id', scoreId)
    .single()

  if (conflict) return { success: false, error: 'Another score already exists for this date.' }

  const { error } = await supabase
    .from('scores')
    .update({ score: newScore, score_date: newDate })
    .eq('id', scoreId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function deleteScore(scoreId: string, userId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('scores')
    .select('user_id')
    .eq('id', scoreId)
    .single()

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: 'Score not found or access denied.' }
  }

  const { error } = await supabase.from('scores').delete().eq('id', scoreId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/scores')
  return { success: true }
}
