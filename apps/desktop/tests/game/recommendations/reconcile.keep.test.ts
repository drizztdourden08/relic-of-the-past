/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import type { ScreenRecord } from '@rotp/game-data';
import { reconcile, scopedToPass, recommendationId } from '@rotp/navigation';
import type { DraftRecommendation, Recommendation } from '@rotp/navigation';
import { required } from '../../required';

const SCREEN_100: ScreenRecord = {
  id: 'screen-100',
  gameId: {},
  kind: 'overworld',
  world: 'light',
  name: 'Screen 100',
  areaId: 'area-000',
  locationId: 'location-000',
  tags: [],
};

const EMPTY_NAV = {
  totalTiles: 0, freeTileCount: 0, maxReachableTileCount: 0, connectionPointIds: [], obstacles: [], features: [],
};

const draft = (overrides: Partial<DraftRecommendation<'screen'>> = {}): DraftRecommendation<'screen'> => ({
  kind: 'screen',
  action: 'update',
  targetId: 'screen-100',
  current: null,
  proposed: SCREEN_100,
  reason: 'palace index disagrees',
  detector: 'screen-identity',
  evidence: [],
  confidence: 'certain',
  screenId: 'screen-100',
  origin: 'live',
  key: 'gameId.palaceIndex',
  ...overrides,
});

const entryFrom = (d: DraftRecommendation<'screen'>, overrides: Partial<Recommendation> = {}): Recommendation => ({
  ...d,
  id: recommendationId(d),
  state: 'open',
  firstSeenAt: 1000,
  decidedAt: null,
  ...overrides,
});

const firstOf = (entries: readonly Recommendation[]): Recommendation => required(entries[0], 'the first entry');

describe('recommendationId', () => {
  it('is derived from content, so the same finding mints the same id twice', () => {
    expect(recommendationId(draft())).toBe(recommendationId(draft()));
  });

  it('ignores the proposed record, which shifts between passes', () => {
    const withNav = draft({ proposed: { ...SCREEN_100, nav: EMPTY_NAV } });
    expect(recommendationId(withNav)).toBe(recommendationId(draft()));
  });

  it('separates two findings that differ only in their key', () => {
    expect(recommendationId(draft({ key: 'gameId.roomIndex' }))).not.toBe(recommendationId(draft()));
  });

  it('separates two findings that differ only in their screen', () => {
    expect(recommendationId(draft({ screenId: 'screen-200' }))).not.toBe(recommendationId(draft()));
  });
});

describe('reconcile', () => {
  it('collapses a re-detected finding onto its existing entry instead of duplicating it', () => {
    const previous = [entryFrom(draft())];
    const next = reconcile(previous, [draft()], { now: 2000 });

    expect(next).toHaveLength(1);
    const first = firstOf(next);
    expect(first.id).toBe(firstOf(previous).id);
    expect(first.firstSeenAt).toBe(1000);
    expect(first.state).toBe('open');
  });

  it('refreshes the payload of a finding that still reproduces', () => {
    const previous = [entryFrom(draft())];
    const next = reconcile(previous, [draft({ reason: 'a better explanation' })], { now: 2000 });

    expect(firstOf(next).reason).toBe('a better explanation');
  });

  it('resolves an open finding that no longer reproduces', () => {
    const previous = [entryFrom(draft())];
    const first = firstOf(reconcile(previous, [], { now: 2000 }));

    expect(first.state).toBe('resolved');
    expect(first.decidedAt).toBe(2000);
  });

  it('keeps a dismissed finding dismissed when it is detected again', () => {
    const previous = [entryFrom(draft(), { state: 'dismissed', decidedAt: 1500 })];
    const next = reconcile(previous, [draft()], { now: 2000 });

    expect(next).toHaveLength(1);
    const first = firstOf(next);
    expect(first.state).toBe('dismissed');
    expect(first.decidedAt).toBe(1500);
  });

  it('keeps an accepted finding accepted when it stops reproducing', () => {
    const previous = [entryFrom(draft(), { state: 'accepted', decidedAt: 1500 })];
    const next = reconcile(previous, [], { now: 2000 });

    expect(firstOf(next).state).toBe('accepted');
  });

  it('does not re-add a dismissed finding as a second, open entry', () => {
    const previous = [entryFrom(draft(), { state: 'dismissed', decidedAt: 1500 })];
    const twice = reconcile(reconcile(previous, [draft()], { now: 2000 }), [draft()], { now: 3000 });

    expect(twice).toHaveLength(1);
    expect(firstOf(twice).state).toBe('dismissed');
  });

  it('reopens a resolved finding that comes back, because resolved is a state, not a verdict', () => {
    const previous = [entryFrom(draft(), { state: 'resolved', decidedAt: 1500 })];
    const first = firstOf(reconcile(previous, [draft()], { now: 2000 }));

    expect(first.state).toBe('open');
    expect(first.decidedAt).toBeNull();
  });

  it('leaves a resolved finding alone while it stays gone', () => {
    const previous = [entryFrom(draft(), { state: 'resolved', decidedAt: 1500 })];
    const first = firstOf(reconcile(previous, [], { now: 2000 }));

    expect(first.state).toBe('resolved');
    expect(first.decidedAt).toBe(1500);
  });

  it('adds a new finding as open, stamped now', () => {
    const next = reconcile([], [draft()], { now: 2000 });

    expect(next).toHaveLength(1);
    const first = firstOf(next);
    expect(first.state).toBe('open');
    expect(first.firstSeenAt).toBe(2000);
  });
});

describe('scopedToPass', () => {
  const other = entryFrom(draft({ screenId: 'screen-999', targetId: 'screen-999' }));
  const mine = entryFrom(draft());

  it('does not resolve findings about a screen this pass never looked at', () => {
    const inScope = scopedToPass(['screen-identity'], 'screen-100');
    const next = reconcile([mine, other], [], { inScope, now: 2000 });

    expect(next.find(r => r.id === other.id)?.state).toBe('open');
    expect(next.find(r => r.id === mine.id)?.state).toBe('resolved');
  });

  it('does not resolve findings owned by a detector that did not run', () => {
    const foreign = entryFrom(draft({ detector: 'connection-shape' }));
    const inScope = scopedToPass(['screen-identity'], 'screen-100');
    const next = reconcile([foreign], [], { inScope, now: 2000 });

    expect(firstOf(next).state).toBe('open');
  });
});
