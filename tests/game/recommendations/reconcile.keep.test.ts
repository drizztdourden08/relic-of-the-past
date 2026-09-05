/* @layer test @kind test */
/** Reconciliation stops duplicate findings and makes a dismissal stick. Both failures are silent in the UI. */
import { describe, it, expect } from 'vitest';
import { reconcile, scopedToPass, recommendationId } from '@shared/game/recommendations';
import type { DraftRecommendation, Recommendation } from '@shared/game/recommendations';

const draft = (overrides: Partial<DraftRecommendation<'screen'>> = {}): DraftRecommendation<'screen'> => ({
  kind: 'screen',
  action: 'update',
  targetId: 'screen-100',
  current: null,
  proposed: { id: 'screen-100' } as DraftRecommendation<'screen'>['proposed'],
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
}) as Recommendation;

describe('recommendationId', () => {
  it('is derived from content, so the same finding mints the same id twice', () => {
    expect(recommendationId(draft())).toBe(recommendationId(draft()));
  });

  it('ignores the proposed record, which shifts between passes', () => {
    const withNav = draft({ proposed: { id: 'screen-100', nav: {} } as DraftRecommendation<'screen'>['proposed'] });
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
    expect(next[0].id).toBe(previous[0].id);
    expect(next[0].firstSeenAt).toBe(1000);
    expect(next[0].state).toBe('open');
  });

  it('refreshes the payload of a finding that still reproduces', () => {
    const previous = [entryFrom(draft())];
    const next = reconcile(previous, [draft({ reason: 'a better explanation' })], { now: 2000 });

    expect(next[0].reason).toBe('a better explanation');
  });

  it('resolves an open finding that no longer reproduces', () => {
    const previous = [entryFrom(draft())];
    const next = reconcile(previous, [], { now: 2000 });

    expect(next[0].state).toBe('resolved');
    expect(next[0].decidedAt).toBe(2000);
  });

  it('keeps a dismissed finding dismissed when it is detected again', () => {
    const previous = [entryFrom(draft(), { state: 'dismissed', decidedAt: 1500 })];
    const next = reconcile(previous, [draft()], { now: 2000 });

    expect(next).toHaveLength(1);
    expect(next[0].state).toBe('dismissed');
    expect(next[0].decidedAt).toBe(1500);
  });

  it('keeps an accepted finding accepted when it stops reproducing', () => {
    const previous = [entryFrom(draft(), { state: 'accepted', decidedAt: 1500 })];
    const next = reconcile(previous, [], { now: 2000 });

    expect(next[0].state).toBe('accepted');
  });

  it('does not re-add a dismissed finding as a second, open entry', () => {
    const previous = [entryFrom(draft(), { state: 'dismissed', decidedAt: 1500 })];
    const twice = reconcile(reconcile(previous, [draft()], { now: 2000 }), [draft()], { now: 3000 });

    expect(twice).toHaveLength(1);
    expect(twice[0].state).toBe('dismissed');
  });

  it('reopens a resolved finding that comes back, because resolved is a state, not a verdict', () => {
    const previous = [entryFrom(draft(), { state: 'resolved', decidedAt: 1500 })];
    const next = reconcile(previous, [draft()], { now: 2000 });

    expect(next[0].state).toBe('open');
    expect(next[0].decidedAt).toBeNull();
  });

  it('leaves a resolved finding alone while it stays gone', () => {
    const previous = [entryFrom(draft(), { state: 'resolved', decidedAt: 1500 })];
    const next = reconcile(previous, [], { now: 2000 });

    expect(next[0].state).toBe('resolved');
    expect(next[0].decidedAt).toBe(1500);
  });

  it('adds a new finding as open, stamped now', () => {
    const next = reconcile([], [draft()], { now: 2000 });

    expect(next).toHaveLength(1);
    expect(next[0].state).toBe('open');
    expect(next[0].firstSeenAt).toBe(2000);
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

    expect(next[0].state).toBe('open');
  });
});
