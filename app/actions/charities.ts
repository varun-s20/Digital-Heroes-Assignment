'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
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

export async function addCharity(formData: {
  name: string
  slug: string
  category: string
  description: string
  image_url: string
  is_active: boolean
}): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase.from('charities').insert({
    name: formData.name,
    slug: formData.slug,
    category: formData.category,
    description: formData.description,
    image_url: formData.image_url,
    is_active: formData.is_active,
    total_raised: 0,
  })

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

export async function updateCharity(
  id: string,
  formData: {
    name: string
    slug: string
    category: string
    description: string
    image_url: string
    is_active: boolean
  }
): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('charities')
    .update({
      name: formData.name,
      slug: formData.slug,
      category: formData.category,
      description: formData.description,
      image_url: formData.image_url,
      is_active: formData.is_active,
    })
    .eq('id', id)

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

export async function deleteCharity(id: string): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('charities')
    .delete()
    .eq('id', id)

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}
