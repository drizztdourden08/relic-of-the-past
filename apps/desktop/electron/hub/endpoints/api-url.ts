/* @layer electron-main @kind logic */
import { formatPath } from '@rotp/hub-contracts';
import type { PathParams, RouteDef } from '@rotp/hub-contracts';
import type { HubApi, QueryParams } from './endpoints.type';
import { queryString } from './query-string';

const apiUrl = (api: HubApi, route: RouteDef, params: PathParams = {}, query: QueryParams = {}): string =>
  `${api.origin}/api${formatPath(route.path, params)}${queryString(query)}`;

export { apiUrl };
