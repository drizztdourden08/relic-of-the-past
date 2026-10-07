/* @layer hub-core @kind types */
import type { Request, Response } from '@google-cloud/functions-framework';
import type { HttpMethod } from '../../shared/hub';

type RouteContext = {
  req: Request;
  res: Response;
  params: Record<string, string>;
};

type RouteHandler = (ctx: RouteContext) => Promise<void>;

/** One entry of the route table. `path` uses `:name` segments, matched after
 *  the prefix the Hosting rewrite leaves on the URL is stripped. */
type Route = {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
};

export type { HttpMethod, RouteContext, RouteHandler, Route };
