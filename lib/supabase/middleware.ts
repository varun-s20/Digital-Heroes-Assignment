import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  // Define protected routes
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')

  // Not authenticated? Redirect to login for protected routes
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Check roles and subscription status if authenticated
  if (user) {
    // We need to fetch the user profile to check roles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'subscriber'

    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard' // or a 403 page
      return NextResponse.redirect(url)
    }

    /*
    if (isDashboardRoute) {
      // Fetch subscription status
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      const status = sub?.status || 'none'
      
      // If they are on dashboard but don't have an active subscription, redirect them to subscribe
      // EXCEPT if they are going to settings or subscribe page explicitly
      if (status !== 'active' && pathname !== '/dashboard/settings' && pathname !== '/subscribe') {
         // Maybe allow access to specific dashboard pages even if lapsed? The PRD says:
         // "Lapsed users cannot enter new scores but can view their history."
         // So maybe don't redirect them entirely, but enforce it on the specific pages / server actions.
         // Let's rely on Server Actions and Page-level checks for specific features (like entering scores)
         // rather than global redirect, to allow viewing history.
      }
    }
    */
  }

  return supabaseResponse
}
