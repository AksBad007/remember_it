import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    console.log("middleware")

//   return NextResponse.redirect(new URL('/about-2', request.url))
}

export const config = {
  matcher: ['/auth'],
}