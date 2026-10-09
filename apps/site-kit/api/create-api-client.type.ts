/* @layer site-kit @kind types */
import type { PathParams, RouteDef } from '@rotp/hub-contracts';
import type { createApiClient } from './create-api-client';

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
};

type RouteName<Routes extends Record<string, RouteDef>> = keyof Routes & string;

type ApiClient<Routes extends Record<string, RouteDef>> = ReturnType<typeof createApiClient<Routes>>;

export type { ApiClient, RequestOptions, QueryParams, RouteName };
