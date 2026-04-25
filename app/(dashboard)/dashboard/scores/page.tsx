import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoresClient from './ScoresClient'

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/scores')

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })

  return <ScoresClient userId={user.id} initialScores={scores ?? []} />
}
