/* @layer hub-core @kind logic */
import type { CookieOptions } from './cookies.type';

const serializeCookie = (name: string, value: string, { maxAgeSeconds, path = '/' }: CookieOptions): string =>
  `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=${path}; HttpOnly; Secure; SameSite=Lax`;

export { serializeCookie };
