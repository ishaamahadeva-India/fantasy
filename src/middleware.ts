
import { createI18nMiddleware } from 'next-international/middleware';
import { type NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n/locales';

const I18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale,
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)'],
};
