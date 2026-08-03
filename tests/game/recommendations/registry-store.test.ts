/* @layer test @kind test */
/**
 * The registry barrel installs the built-ins, and a pass through the store
 * scopes reconciliation to what actually ran. The scoping is the part worth
 * pinning: without it a pass on one screen resolves every finding about every
 * other one, which looks like the store working and is the opposite.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { all, find } from '@shared/game/data';
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import {
  createRecommendationStore, detectorsFor, memoryStorage, recommendationFile, runDetection,
} from '@shared/game/recommendations';
import type { DetectionContext, ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import '@app/ui/domains/widgets/navigation/recommendations/detectors';

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
  realTransitions: [],
  realAvailable: true,
  unmatchedCrossings: [],
  floodConnections: [],
  existingConnections: [],
  palaceMismatches: [],
  ...overrides,
});

/** A screen with auditable outgoing edges, plus a transition that backs none of them. */
const auditableScreen = () => {
  const screen = all('screen').find(s =>
    find('connection', c => c.fromScreenId === s.id && c.toScreenId !== s.id && c.kind !== 'edge').length > 0);
  if (!screen) throw new Error('dataset has no auditable screen');
  const spare = all('screen').map(s => s.gameId.roomIndex).find((n): n is number => n != null);
  const realTransitions: ObservedTransition[] = [{ source: 'test', kind: 'room', index: spare as number }];
  return { screenId: screen.id as ScreenId, realTransitions };
};

const contextFor = (screenId: ScreenId, realTransitions: ObservedTransition[]): DetectionContext =>
  ({ origin: 'live', screenId, observations: observations({ realTransitions }) });

describe('the detector barrel', () => {
  it('installs a detector for both kinds it covers', () => {
    expect(detectorsFor('connection').map(d => d.id).sort())
      .toEqual(['connection-add', 'connection-remove', 'connection-shape']);
    expect(detectorsFor('screen').map(d => d.id)).toEqual(['screen-identity']);
  });

  it('reports every detector that ran, including the ones that found nothing', () => {
    const { screenId, realTransitions } = auditableScreen();
    const run = runDetection('connection', contextFor(screenId, realTransitions));
    expect(run.detectorIds).toContain('connection-add');
    expect(run.drafts.length).toBeGreaterThan(0);
  });
});

describe('the recommendation store', () => {
  const { screenId, realTransitions } = auditableScreen();
  let store: ReturnType<typeof createRecommendationStore>;

  beforeEach(() => { store = createRecommendationStore(memoryStorage()); });

  it('names one file per collection', () => {
    expect(recommendationFile('connection')).toBe('recommendations/connection.json');
  });

  it('does not duplicate anything when the same pass runs twice', async () => {
    const context = contextFor(screenId, realTransitions);
    const run = runDetection('connection', context);

    const first = await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);
    const second = await store.applyPass('connection', context, run.detectorIds, run.drafts, 2000);

    expect(second.entries).toHaveLength(first.entries.length);
    expect(second.entries.every(e => e.firstSeenAt === 1000)).toBe(true);
  });

  it('keeps a dismissal across a re-detection', async () => {
    const context = contextFor(screenId, realTransitions);
    const run = runDetection('connection', context);
    const { entries } = await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    await store.decide('connection', entries[0].id, 'dismissed', 1500);
    const after = await store.applyPass('connection', context, run.detectorIds, run.drafts, 2000);

    expect(after.entries.find(e => e.id === entries[0].id)?.state).toBe('dismissed');
    expect(after.entries.filter(e => e.id === entries[0].id)).toHaveLength(1);
  });

  it('does not resolve findings about a screen the pass never visited', async () => {
    const context = contextFor(screenId, realTransitions);
    const run = runDetection('connection', context);
    await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    // A second pass on a DIFFERENT screen that finds nothing at all.
    const elsewhere = all('screen').find(s => s.id !== screenId) as { id: ScreenId };
    const empty = contextFor(elsewhere.id, []);
    const after = await store.applyPass('connection', empty, run.detectorIds, [], 2000);

    expect(after.entries.every(e => e.state === 'open')).toBe(true);
  });

  it('resolves a finding once the pass that owns it stops reproducing it', async () => {
    const context = contextFor(screenId, realTransitions);
    const run = runDetection('connection', context);
    await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    const after = await store.applyPass('connection', context, run.detectorIds, [], 2000);
    expect(after.entries.every(e => e.state === 'resolved')).toBe(true);
  });

  it('carries a record, not a code string — the whole point of the unification', async () => {
    const context = contextFor(screenId, realTransitions);
    const run = runDetection('connection', context);
    const { entries } = await store.applyPass('connection', context, run.detectorIds, run.drafts, 1000);

    for (const entry of entries) {
      expect(typeof entry.proposed).toBe('object');
      if (entry.action !== 'create') expect((entry.current as ConnectionRecord).id).toBe(entry.targetId);
    }
  });
});
