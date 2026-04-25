import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminWinnersClient from './AdminWinnersClient'

export default async function AdminWinnersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: winnings } = await adminSupabase
    .from('winnings')
    .select(`
      *,
      profiles!winnings_user_id_fkey(full_name, email),
      draws(draw_month)
    `)
    .order('created_at', { ascending: false })

  return <AdminWinnersClient winnings={winnings ?? []} />
}
