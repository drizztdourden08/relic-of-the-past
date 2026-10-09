/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { Recommendation } from '../types';
import type { RecommendationStorage } from './store.type';

const memoryStorage = (seed: Partial<Record<EntityKind, readonly Recommendation[]>> = {}): RecommendationStorage => {
  const held = new Map<EntityKind, readonly Recommendation[]>(
    Object.entries(seed) as [EntityKind, readonly Recommendation[]][],
  );
  return {
    load: (kind) => Promise.resolve(held.get(kind) ?? []),
    save: (kind, entries) => { held.set(kind, entries); return Promise.resolve(); },
  };
};

export { memoryStorage };
