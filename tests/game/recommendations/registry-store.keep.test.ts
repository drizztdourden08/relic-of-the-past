/* @layer test @kind test */
/**
 * The registry barrel installs the built-ins, and a pass scopes reconciliation
 * to what ran. Without the scoping a pass on one screen resolves every finding
 * about every other one, which looks like the store working.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { all, find } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import {
  createRecommendationStore, detectorsFor, memoryStorage, recommendationFile, runDetection,
} from '@shared/game/recommendations';
import type { DetectionContext, ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import '@app/ui/domains/widgets/navigation/recommendations/strategies/connection';
import '@shared/game/recommendations/strategies/screen';
import '@shared/game/recommendations/strategy-detectors';
// Must come after `strategy-detectors`. See `wire-detector.ts`'s own header.
import '@app/ui/domains/widgets/navigation/recommendations/strategies/connection/wire-detector';
import { describeDataset } from '../../dataset-guard';

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
  isDarkWorld: false,
  realTransitions: [],
  realAvailable: true,
  unmatchedCrossings: [],
  floodConnections: [],
  existingConnections: [],
  palaceMismatches: [],
  ...overrides,
});

/**
 * A screen with auditable outgoing edges plus a transition that backs none.
 * `existingConnections` comes straight from the dataset registry, as
 * `use-screen-observations.ts` does; the `strategy:connection` `SetProbe`s
 * read `observations.existingConnections`, not the registry.
 */
const auditableScreen = () => {
  const screen = all('screen').find(s =>
    find('connection', c => c.screenId === s.id && toScreenIdOf(c) !== s.id && c.kind !== 'edge').length > 0);
  if (!screen) throw new Error('dataset has no auditable screen');
  const spare = all('screen').map(s => s.gameId.roomIndex).find((n): n is number => n != null);
  const realTransitions: ObservedTransition[] = [{ source: 'test', kind: 'room', index: spare as number }];
  const existingConnections = find('connection', c => c.screenId === screen.id || toScreenIdOf(c) === screen.id);
  return { screenId: screen.id as ScreenId, realTransitions, existingConnections };
};

const contextFor = (screenId: ScreenId, realTransitions: ObservedTransition[], existingConnections: ConnectionRecord[] = []): DetectionContext =>
  ({ origin: 'live', screenId, observations: observations({ realTransitions, existingConnections }) });

describeDataset('the detector barrel', () => {
  it('installs a detector for both kinds it covers', () => {
    // `connection-shape`/`screen-identity` became `strategy:connection` and
    // `strategy:screen`; `connection-add`/`connection-remove` folded into
    // `strategy:connection` (phase 4, part 2). The direction-tag detector is
    // gone with the `dir:*` namespace; direction derives from `canExit`.
    expect(detectorsFor('connection').map(d => d.id).sort())
      .toEqual(['strategy:connection']);
    expect(detectorsFor('screen').map(d => d.id)).toEqual(['strategy:screen']);
  });

  it('reports every detector that ran, including the ones that found nothing', () => {
    const { screenId, realTransitions, existingConnections } = auditableScreen();
    const run = runDetection('connection', contextFor(screenId, realTransitions, existingConnections));
    expect(run.detectorIds).toContain('strategy:connection');
    expect(run.drafts.length).toBeGreaterThan(0);
  });
});

describeDataset('the recommendation store', () => {
  const { screenId, realTransitions, existingConnections } = auditableScreen();
  let store: ReturnType<typeof createRecommendationStore>;

  beforeEach(() => { store = createRecommendationStore(memoryStorage()); });

  it('names one file per collection', () => {
    expect(recommendationFile('connection')).toBe('recommendations/connection.json');
  });

  it('does not duplicate anything when the same pass runs twice', async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);

    const first = await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);
    const second = await store.applyPass('connection', context, run.detectorIds, run.drafts, 2000);

    expect(second.entries).toHaveLength(first.entries.length);
    expect(second.entries.every(e => e.firstSeenAt === 1000)).toBe(true);
  });

  it('keeps a dismissal across a re-detection', async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    const { entries } = await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    await store.decide('connection', entries[0].id, 'dismissed', 1500);
    const after = await store.applyPass('connection', context, run.detectorIds, run.drafts, 2000);

    expect(after.entries.find(e => e.id === entries[0].id)?.state).toBe('dismissed');
    expect(after.entries.filter(e => e.id === entries[0].id)).toHaveLength(1);
  });

  it('does not resolve findings about a screen the pass never visited', async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    // A second pass on a DIFFERENT screen that finds nothing at all.
    const elsewhere = all('screen').find(s => s.id !== screenId) as { id: ScreenId };
    const empty = contextFor(elsewhere.id, []);
    const after = await store.applyPass('connection', empty, run.detectorIds, [], 2000);

    expect(after.entries.every(e => e.state === 'open')).toBe(true);
  });

  it('resolves a finding once the pass that owns it stops reproducing it', async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    const after = await store.applyPass('connection', context, run.detectorIds, [], 2000);
    expect(after.entries.every(e => e.state === 'resolved')).toBe(true);
  });

  it('carries a record, not a code string, which was the whole point of the unification', async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    const { entries } = await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    for (const entry of entries) {
      expect(typeof entry.proposed).toBe('object');
      if (entry.action !== 'create') expect((entry.current as ConnectionRecord).id).toBe(entry.targetId);
    }
  });
});
