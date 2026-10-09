/* @layer hub-core @kind types */
import type { RouteHandler } from '../route.type';

type RouterOptions = {
  origins: () => readonly string[];
  prefix: string;
};

type RouteMatch = { handler: RouteHandler; params: Record<string, string> } | { status: 404 | 405 };

type ErrorReply = { status: number; error: string };

export type { RouterOptions, RouteMatch, ErrorReply };
