/* @layer test @kind test */
import { it, expect, beforeEach } from 'vitest';
import { all, find, toScreenIdOf } from '@rotp/game-data';
import type { ConnectionRecord, ScreenId } from '@rotp/game-data';
import { createRecommendationStore, memoryStorage, runDetection } from '@rotp/navigation';
import type { DetectionContext, ScreenObservations } from '@rotp/navigation';
import type { ObservedTransition } from '@rotp/game-core';
import '@app/nav-widget/recommendations/strategies/connection';
import '@app/nav-widget/recommendations/strategies/connection/wire-detector';
import { describeDataset } from '../../dataset-guard';
import { required } from '../../required';

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

const auditableScreen = () => {
  const screen = all('screen').find(s =>
    find('connection', c => c.screenId === s.id && toScreenIdOf(c) !== s.id && c.kind !== 'edge').length > 0);
  if (!screen) throw new Error('dataset has no auditable screen');
  const spare = all('screen').map(s => s.gameId.roomIndex).find((n): n is number => n != null);
  const realTransitions: ObservedTransition[] = [{ source: 'test', kind: 'room', index: spare as number }];
  const existingConnections = find('connection', c => c.screenId === screen.id || toScreenIdOf(c) === screen.id);
  return { screenId: screen.id, realTransitions, existingConnections };
};

const contextFor = (screenId: ScreenId, realTransitions: ObservedTransition[], existingConnections: ConnectionRecord[] = []): DetectionContext =>
  ({ origin: 'live', screenId, observations: observations({ realTransitions, existingConnections }) });

describeDataset('the detector barrel', () => {
  it('reports every detector that ran, including the ones that found nothing', { tags: ['critical'] }, () => {
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

  it('does not duplicate anything when the same pass runs twice', { tags: ['critical'] }, async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);

    const first = await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: run.drafts }, 1000);
    const second = await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: run.drafts }, 2000);

    expect(second.entries).toHaveLength(first.entries.length);
    expect(second.entries.every(e => e.firstSeenAt === 1000)).toBe(true);
  });

  it('keeps a dismissal across a re-detection', { tags: ['critical'] }, async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    const { entries } = await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: run.drafts }, 1000);

    const firstId = required(entries[0], 'the first entry').id;
    await store.decide('connection', firstId, 'dismissed', 1500);
    const after = await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: run.drafts }, 2000);

    expect(after.entries.find(e => e.id === firstId)?.state).toBe('dismissed');
    expect(after.entries.filter(e => e.id === firstId)).toHaveLength(1);
  });

  it('does not resolve findings about a screen the pass never visited', { tags: ['critical'] }, async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: run.drafts }, 1000);

    const elsewhere = all('screen').find(s => s.id !== screenId) as { id: ScreenId };
    const empty = contextFor(elsewhere.id, []);
    const after = await store.applyPass('connection', empty, { detectorIds: run.detectorIds, fresh: [] }, 2000);

    expect(after.entries.every(e => e.state === 'open')).toBe(true);
  });

  it('resolves a finding once the pass that owns it stops reproducing it', { tags: ['critical'] }, async () => {
    const context = contextFor(screenId, realTransitions, existingConnections);
    const run = runDetection('connection', context);
    await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: run.drafts }, 1000);

    const after = await store.applyPass('connection', context, { detectorIds: run.detectorIds, fresh: [] }, 2000);
    expect(after.entries.every(e => e.state === 'resolved')).toBe(true);
  });
});
