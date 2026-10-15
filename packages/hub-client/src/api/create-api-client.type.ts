/* @layer site-kit @kind types */
import type { PathParams, RouteDef } from '@rotp/hub-contracts';

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
};

type RouteName<Routes extends Record<string, RouteDef>> = keyof Routes & string;

export type { RequestOptions, RouteName };
