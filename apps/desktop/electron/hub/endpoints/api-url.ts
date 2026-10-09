/* @layer electron-main @kind logic */
import { formatPath } from '@shared/hub';
import type { PathParams, RouteDef } from '@shared/hub';
import type { HubApi, QueryParams } from './endpoints.type';
import { queryString } from './query-string';

const apiUrl = (api: HubApi, route: RouteDef, params: PathParams = {}, query: QueryParams = {}): string =>
  `${api.origin}/api${formatPath(route.path, params)}${queryString(query)}`;

export { apiUrl };
