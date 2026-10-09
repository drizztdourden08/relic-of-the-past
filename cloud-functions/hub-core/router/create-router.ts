/* @layer hub-core @kind logic */
import type { Request, Response } from '@google-cloud/functions-framework';
import { ZodError } from 'zod';
import { HttpError } from '../http/http-error';
import type { HttpMethod, Route } from '../route.type';
import { findRoute } from './find-route';
import type { ErrorReply, RouterOptions } from './router.type';
import { stripPrefix } from './strip-prefix';

const originAllowed = (req: Request, origins: readonly string[]): boolean => {
  const origin = req.headers.origin;
  return !origin || origins.includes(origin);
};

const errorStatus = (err: unknown): ErrorReply => {
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

export { createRouter };
