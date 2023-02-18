import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyClaim } from './lib/Helpers/backCommon'

export async function middleware(req: NextRequest) {
  const auth_token = req.cookies.get('auth_token')?.value
  const requestHeaders = new Headers(req.headers)

  if (auth_token) {
    if (req.nextUrl.pathname.startsWith('/auth'))
      return NextResponse.redirect(new URL('/calendar', req.url))

    const decoded = await verifyClaim(auth_token as string)
    const userID = decoded.payload.userID as string

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
