/* @layer hub-core @kind logic */
/** Method + path dispatch over a route table. Strips the prefix the Hosting rewrite
 *  forwards, fills `:name` params, checks the Origin header on state-changing calls, and
 *  renders every thrown error as `{ error }`. */
import type { Request, Response } from '@google-cloud/functions-framework';
import { ZodError } from 'zod';
import { HttpError } from './http/http-error';
import type { HttpMethod, Route, RouteHandler } from './route.type';

type RouterOptions = {
  /** The origins a browser may call from; read at request time. */
  origins: () => readonly string[];
  /** The path prefix the Hosting rewrite leaves on the URL, such as `/api`. */
  prefix: string;
};

const stripPrefix = (path: string, prefix: string): string => {
  const bare = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  const trimmed = bare.length > 1 && bare.endsWith('/') ? bare.slice(0, -1) : bare;
  return trimmed || '/';
};

const matchPath = (pattern: string, path: string): Record<string, string> | null => {
  const want = pattern.split('/');
  const got = path.split('/');
  if (want.length !== got.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i += 1) {
    const segment = want[i];
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(got[i]);
    } else if (segment !== got[i]) {
      return null;
    }
  }
  return params;
};

type Match = { handler: RouteHandler; params: Record<string, string> } | { status: 404 | 405 };

const findRoute = (routes: Route[], method: string, path: string): Match => {
  let pathMatched = false;
  for (const route of routes) {
    const params = matchPath(route.path, path);
    if (!params) continue;
    pathMatched = true;
    if (route.method === method) return { handler: route.handler, params };
  }
  return { status: pathMatched ? 405 : 404 };
};

/** A browser sends Origin on every cross-site or state-changing request; a
 *  mismatch means a foreign page is driving the session cookie. The app's own
 *  fetch sends none, which passes. */
const originAllowed = (req: Request, origins: readonly string[]): boolean => {
  const origin = req.headers.origin;
  return !origin || origins.includes(origin);
};

const errorStatus = (err: unknown): { status: number; error: string } => {
  if (err instanceof HttpError) return { status: err.status, error: err.message };
  if (err instanceof ZodError) return { status: 400, error: err.issues[0]?.message ?? 'Malformed request' };
  console.error(err);
  return { status: 500, error: 'Something went wrong.' };
};

const createRouter = (routes: Route[], options: RouterOptions) => async (req: Request, res: Response): Promise<void> => {
  const { origins, prefix } = options;
  const method = req.method.toUpperCase() as HttpMethod;
  const path = stripPrefix(req.path, prefix);
  const match = findRoute(routes, method, path);
  if ('status' in match) {
    res.status(match.status).json({ error: match.status === 404 ? 'No such route.' : 'Method not allowed.' });
    return;
  }
  if (method !== 'GET' && !originAllowed(req, origins())) {
    res.status(403).json({ error: 'Origin not allowed.' });
    return;
  }
  try {
    await match.handler({ req, res, params: match.params });
  } catch (err) {
    const { status, error } = errorStatus(err);
    if (!res.headersSent) res.status(status).json({ error });
  }
};

export { createRouter, stripPrefix, matchPath };
export type { RouterOptions };
