import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDrawsClient from './AdminDrawsClient'

export default async function AdminDrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: draws } = await adminSupabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })

  const { data: activeSubsCount } = await adminSupabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  return <AdminDrawsClient draws={draws ?? []} activeSubscriberCount={activeSubsCount ?? 0} />
}
