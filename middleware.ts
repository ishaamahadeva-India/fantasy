import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!pathname.startsWith('/fantasy')) return NextResponse.next();
  if (pathname.startsWith('/subscription')) return NextResponse.next();

  const access = req.cookies.get('qb_sub_access')?.value;
  if (access === 'active') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/subscription';
  url.searchParams.set('redirect', `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/fantasy/:path*'],
};
