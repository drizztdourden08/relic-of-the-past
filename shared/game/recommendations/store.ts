/* @layer shared-game @kind logic */
/**
 * The recommendation collection, and the only place a detection pass is folded
 * in.
 *
 * `shared/game/` is a leaf with no Node and no `window`, so the store does not
 * open files — it takes a storage PORT and the host supplies the adapter
 * (Electron writes the JSON, a test keeps a Map in memory). All the interesting
 * behaviour is `reconcile`, which is a pure function tested on its own; what is
 * left here is the part that decides the scope of a pass and persists the
 * result, and it is thin on purpose.
 *
 * One file per collection, keyed by the content-derived id, mirroring the
 * whole-file JSON precedent the review data already set.
 */
import type { EntityKind } from '../data/types';
import type { DetectionContext } from './detection-types';
import { reconcile, scopedToPass } from './reconcile';
import type { DraftRecommendation, Recommendation } from './types';

/** `Data/recommendations/<kind>.json`, relative to the app's user-data root. */
const recommendationFile = (kind: EntityKind): string => `recommendations/${kind}.json`;

interface RecommendationStorage {
  load: (kind: EntityKind) => Promise<readonly Recommendation[]>;
  save: (kind: EntityKind, entries: readonly Recommendation[]) => Promise<void>;
}

/** An in-memory port — the default, and what a test uses. */
const memoryStorage = (seed: Partial<Record<EntityKind, readonly Recommendation[]>> = {}): RecommendationStorage => {
  const held = new Map<EntityKind, readonly Recommendation[]>(
    Object.entries(seed) as [EntityKind, readonly Recommendation[]][],
  );
  return {
    load: (kind) => Promise.resolve(held.get(kind) ?? []),
    save: (kind, entries) => { held.set(kind, entries); return Promise.resolve(); },
  };
};

interface PassResult {
  kind: EntityKind;
  entries: readonly Recommendation[];
}

const createRecommendationStore = (storage: RecommendationStorage = memoryStorage()) => {
  const list = (kind: EntityKind): Promise<readonly Recommendation[]> => storage.load(kind);

  /**
   * Folds one detector run into the stored collection for `kind`.
   *
   * The scope comes from the pass itself — the detectors that ran and the screen
   * they ran for — so a pass on one screen can never resolve findings about
   * another. `detectorIds` is the set that RAN, not the set that produced
   * output: a detector that ran and found nothing is exactly how a finding
   * stops reproducing, and leaving it out would keep that finding open forever.
   */
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
    await storage.save(kind, entries);
    return { kind, entries };
  };

  /** Records a person's verdict. The state it writes is one reconcile never moves. */
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

type RecommendationStore = ReturnType<typeof createRecommendationStore>;

export { createRecommendationStore, memoryStorage, recommendationFile };
export type { PassResult, RecommendationStorage, RecommendationStore };
