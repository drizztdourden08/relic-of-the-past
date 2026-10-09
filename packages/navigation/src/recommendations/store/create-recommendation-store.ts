/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '../detection-types';
import { reconcile, scopedToPass } from '../reconcile';
import type { DraftRecommendation, Recommendation } from '../types';
import { memoryStorage } from './memory-storage';
import type { PassResult, RecommendationStorage } from './store.type';

const unchanged = (previous: readonly Recommendation[], next: readonly Recommendation[]): boolean =>
  previous.length === next.length && next.every((entry, at) => entry === previous[at]);

const createRecommendationStore = (storage: RecommendationStorage = memoryStorage()) => {
  const list = (kind: EntityKind): Promise<readonly Recommendation[]> => storage.load(kind);

  const applyPass = async (
    kind: EntityKind,
    context: DetectionContext,
    detectorIds: readonly string[],
    fresh: readonly DraftRecommendation[],
    now?: number,
  ): Promise<PassResult> => {
    const previous = await storage.load(kind);
    const entries = reconcile(previous, fresh, {
      inScope: scopedToPass(detectorIds, context.screenId),
      now,
    });
    if (unchanged(previous, entries)) return { kind, entries: previous };
    await storage.save(kind, entries);
    return { kind, entries };
  };

  const decide = async (
    kind: EntityKind,
    id: string,
    state: 'accepted' | 'dismissed',
    now: number = Date.now(),
  ): Promise<readonly Recommendation[]> => {
    const previous = await storage.load(kind);
    const entries = previous.map(entry => entry.id === id ? { ...entry, state, decidedAt: now } : entry);
    await storage.save(kind, entries);
    return entries;
  };

  return { applyPass, decide, list };
};

export { createRecommendationStore };
