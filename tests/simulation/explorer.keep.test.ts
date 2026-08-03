/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createEngineState } from '../../shared/game/simulation/engine/state';
import {
  addKey,
  spendKey,
  keyAvailable,
  buildReachContext,
  applyItem,
  syncReachTokens,
  onCheckVerified,
} from '../../shared/game/simulation/engine/explorer';
import { requirementsMet } from '../../shared/game/simulation/requirements-map';
import { evaluateOutcome } from '../../shared/game/simulation/engine/goal';
import type { DetectedCheck } from '../../shared/game/simulation/types';

/** dungeon-003 is the third dungeon; the id is the identity, its name is not. */
const EASTERN = 'dungeon-003';
const TITANS_MITTS = 'item-029';
const HAMMER = 'item-010';
const BOMB_PICKUP = 'item-041';
const RUPEES = 'item-054';

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

describe('explorer — consumable small keys', () => {
  it('adds, spends, and reports availability per dungeon', () => {
    const s = freshState();
    addKey(s, EASTERN);
    addKey(s, EASTERN);
    expect(keyAvailable(s, EASTERN)).toBe(true);

    expect(spendKey(s, EASTERN)).toBe(true);
    expect(spendKey(s, EASTERN)).toBe(true);
    expect(spendKey(s, EASTERN)).toBe(false); // none left
    expect(keyAvailable(s, EASTERN)).toBe(false);
  });

  it('gates a smallkey requirement on the remaining key count', () => {
    const s = freshState();
    const req = [[`smallkey:${EASTERN}`]];
    expect(requirementsMet(req, buildReachContext(s))).toBe(false);
    addKey(s, EASTERN);
    expect(requirementsMet(req, buildReachContext(s))).toBe(true);
    spendKey(s, EASTERN);
    expect(requirementsMet(req, buildReachContext(s))).toBe(false);
  });

  it('keys one dungeon without crediting another', () => {
    const s = freshState();
    addKey(s, EASTERN);
    expect(keyAvailable(s, 'dungeon-004')).toBe(false);
    expect(keyAvailable(s, '*')).toBe(true);
  });
});

describe('explorer — inventory → traversal tokens', () => {
  it('grants the lower lift rungs with the top one, from the token progression', () => {
    const s = freshState();
    applyItem(s, TITANS_MITTS);
    syncReachTokens(s);
    expect(s.reachTokens.has('lift.3')).toBe(true);
    expect(s.reachTokens.has('lift.2')).toBe(true);
    expect(s.reachTokens.has('lift.1')).toBe(true);
  });
});

describe('explorer — unlock-reset rule', () => {
  const detected = (opts: Partial<DetectedCheck>): DetectedCheck => ({
    evidence: [],
    at: { screenId: 'A', tile: { row: 0, col: 0 } },
    ...opts,
  });

  it('bumps the epoch and re-floods the CURRENT screen on a traversal-affecting item', () => {
    const s = freshState();
    s.frontier = ['B', 'C'];
    s.visited = new Set(['A', 'B']);
    onCheckVerified(s, detected({ itemReceived: HAMMER, checkId: 'check-072' }));
    expect(s.epoch).toBe(1);
    expect(s.frontier).toHaveLength(0);
    // Localized refresh: only the current screen re-floods; other visits stay,
    // and progressSinceEpoch stays set so the exhaustion pass sweeps later.
    expect(s.visited.has('A')).toBe(false);
    expect(s.visited.has('B')).toBe(true);
    expect(s.progressSinceEpoch).toBe(true);
    expect(s.completedChecks.has('check-072')).toBe(true);
  });

  it('marks done and continues (no epoch bump) on a non-traversal item', () => {
    const s = freshState();
    s.frontier = ['B'];
    onCheckVerified(s, detected({ itemReceived: RUPEES, checkId: 'check-073' }));
    expect(s.epoch).toBe(0);
    expect(s.frontier).toEqual(['B']);
    expect(s.progressSinceEpoch).toBe(true);
    expect(s.completedChecks.has('check-073')).toBe(true);
  });

  it('treats the bomb pickup as traversal-affecting', () => {
    const s = freshState();
    onCheckVerified(s, detected({ itemReceived: BOMB_PICKUP, checkId: 'check-074' }));
    expect(s.epoch).toBe(1);
    expect(s.reachTokens.has('bombs')).toBe(true);
  });
});

describe('goal — terminal conditions', () => {
  it('returns null while the frontier still has work', () => {
    const s = freshState();
    s.frontier = ['B'];
    expect(evaluateOutcome(s)).toBeNull();
  });

  it('returns not-completable when the frontier is exhausted with no progress', () => {
    const s = freshState();
    s.frontier = [];
    s.pending = [];
    s.route = [];
    s.progressSinceEpoch = false;
    expect(evaluateOutcome(s)).toBe('not-completable');
  });

  it('returns completed once the goal check is done', () => {
    const s = freshState();
    s.config = { goalCheckId: 'check-097' };
    s.completedChecks.add('check-097');
    expect(evaluateOutcome(s)).toBe('completed');
  });

  it('returns stopped-at-check when the stop flag is set', () => {
    const s = freshState();
    s.stopHit = true;
    expect(evaluateOutcome(s)).toBe('stopped-at-check');
  });
});
