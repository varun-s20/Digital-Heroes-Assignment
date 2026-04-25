import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WinningsClient from './WinningsClient'

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/winnings')

  const { data: winnings } = await supabase
    .from('winnings')
    .select(`
      *,
      draws (draw_month, drawn_numbers)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <WinningsClient userId={user.id} winnings={winnings ?? []} />
}
