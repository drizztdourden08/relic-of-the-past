/* @layer electron-main @kind types */
import type { PathParams, RouteDef } from '@rotp/hub-contracts';
import type { QueryParams } from '../endpoints';

type HubApiError = Error & { status: number };

interface ApiCall {
  route: RouteDef;
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
  token?: string | null;
}

export type { ApiCall, HubApiError };
