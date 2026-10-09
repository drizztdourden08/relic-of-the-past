/* @layer renderer-app @kind logic */
import type { NumberBoundsResolver } from '@ds/composites/RecordEditor';
import { boundResolvers } from './bound-resolvers';
import { resolveNumberBoundsFor } from './resolve-number-bounds-for';

const numberBoundsResolverFor = (collectionKind: string): NumberBoundsResolver => {
  const held = boundResolvers.get(collectionKind);
  if (held) return held;
  const built: NumberBoundsResolver = (path, record) =>
    resolveNumberBoundsFor(collectionKind, path, record);
  boundResolvers.set(collectionKind, built);
  return built;
};

export { numberBoundsResolverFor };
