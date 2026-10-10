/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ErasedSetProbe, SetProbe } from './probe.type';
import { compareSet } from './compare-set';

const eraseSetProbe = <K extends EntityKind, Item>(probe: SetProbe<K, Item>): ErasedSetProbe<K> => ({
  source: probe.source,
  confidence: probe.confidence,
  ...(probe.removalConfidence === undefined ? {} : { removalConfidence: probe.removalConfidence }),
  compare: (observations, screenId) => compareSet(probe, observations, screenId),
});

export { eraseSetProbe };
