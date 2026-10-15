/* @layer site-kit @kind logic */
import { CURRENT_PREFIX, QUERY_SUFFIX } from './create-view-keys.constants';
import type { ViewKeys } from './create-view-keys.type';

const createViewKeys = (prefix: string, surfaces: readonly string[]): ViewKeys => {
  const pattern = new RegExp(`^${prefix}:(${surfaces.join('|')})(\\.query)?(?:~\\d+)?$`);
  return {
    surfaces,
    keyFor: (surface, half, nonce = 0) =>
      `${prefix}:${surface}${half === 'query' ? QUERY_SUFFIX : ''}${nonce ? `~${nonce}` : ''}`,
    parse: (key) => {
      const match = pattern.exec(key);
      if (match === null) return null;
      const [, surface, query] = match;
      return surface === undefined ? null : { surface, half: query ? 'query' : 'table' };
    },
    currentViewId: (surface) => `${CURRENT_PREFIX}${surface}`,
    isCurrentViewId: (id) => id.startsWith(CURRENT_PREFIX),
  };
};

export { createViewKeys };
export type { ViewKeys } from './create-view-keys.type';
