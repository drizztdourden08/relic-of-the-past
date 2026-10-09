/* @layer hub-core @kind types */
import type { Request, Response } from '@google-cloud/functions-framework';
import type { HttpMethod } from '@rotp/hub-contracts';

type RouteContext = {
  req: Request;
  res: Response;
  params: Record<string, string>;
};

type RouteHandler = (ctx: RouteContext) => Promise<void>;

type Route = {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
};

export type { HttpMethod, RouteContext, RouteHandler, Route };
