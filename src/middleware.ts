import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware-client';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Confirm the signed-in user is an active staff account. A guest
    // who happens to be authenticated for some other reason should
    // never see /admin — this mirrors the RLS policies on the server,
    // it doesn't replace them.
    const { data: profile } = await supabase
      .from('profiles')
      .select('active')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.active) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'not_authorized');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
