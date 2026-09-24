/* @layer root-config @kind logic */
/** Cookie read and write for the Express request and response the framework
 *  hands us. Every cookie the API sets is httpOnly, Secure and SameSite=Lax on
 *  the site origin, which the Hosting rewrite keeps first-party. */
import type { Request, Response } from '@google-cloud/functions-framework';

type CookieOptions = { maxAgeSeconds: number; path?: string };

const readCookie = (req: Request, name: string): string | null => {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
};

const serialize = (name: string, value: string, { maxAgeSeconds, path = '/' }: CookieOptions): string =>
  `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=${path}; HttpOnly; Secure; SameSite=Lax`;

const setCookie = (res: Response, name: string, value: string, options: CookieOptions): void => {
  res.append('Set-Cookie', serialize(name, value, options));
};

const clearCookie = (res: Response, name: string, path = '/'): void => {
  res.append('Set-Cookie', serialize(name, '', { maxAgeSeconds: 0, path }));
};

export { readCookie, setCookie, clearCookie };
