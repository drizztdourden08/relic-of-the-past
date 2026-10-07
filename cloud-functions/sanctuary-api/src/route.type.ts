/* @layer root-config @kind types */
import type { Request, Response } from '@google-cloud/functions-framework';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteContext = {
  req: Request;
  res: Response;
  params: Record<string, string>;
};

type RouteHandler = (ctx: RouteContext) => Promise<void>;

/** One entry of the route table. `path` uses `:name` segments, matched after
 *  the `/api` prefix the Hosting rewrite leaves on the URL is stripped. */
type Route = {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
};

export type { HttpMethod, RouteContext, RouteHandler, Route };
