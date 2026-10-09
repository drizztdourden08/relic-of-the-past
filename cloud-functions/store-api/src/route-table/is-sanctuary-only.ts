/* @layer store-api @kind logic */
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_ONLY } from './is-sanctuary-only.constants';

const isSanctuaryOnly = (route: Route): boolean =>
  SANCTUARY_ONLY.some((def) => def.method === route.method && def.path === route.path);

export { isSanctuaryOnly };
