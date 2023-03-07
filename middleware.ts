import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeAuth } from './lib/Helpers/backend_helpers'

export async function middleware(req: NextRequest) {
  const auth_token = req.cookies.get('auth_token')?.value
  const requestHeaders = new Headers(req.headers)

  if (auth_token) {
    if (req.nextUrl.pathname.startsWith('/auth'))
      return NextResponse.redirect(new URL('/calendar', req.url))

    const userID = await decodeAuth(auth_token)

    requestHeaders.set('userID', userID)
  } else if (!req.nextUrl.pathname.startsWith('/auth') && !req.nextUrl.pathname.startsWith('/api'))
    return NextResponse.redirect(new URL('/auth', req.url))

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export const config = {
  matcher: ['/auth', '/api/:path*'],
}
