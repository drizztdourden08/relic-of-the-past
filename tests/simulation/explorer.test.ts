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
  dungeonFromKeyItem,
  canonicalDungeon,
} from '../../shared/game/simulation/engine/explorer';
import { requirementsMet } from '../../shared/game/simulation/requirements-map';
import { evaluateOutcome } from '../../shared/game/simulation/engine/goal';
import type { DetectedCheck } from '../../shared/game/simulation/types';

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

describe('explorer — consumable small keys', () => {
  it('adds, spends, and reports availability per dungeon', () => {
    const s = freshState();
    addKey(s, 'eastern-palace');
    addKey(s, 'eastern-palace');
    expect(keyAvailable(s, 'eastern-palace')).toBe(true);

    expect(spendKey(s, 'eastern-palace')).toBe(true);
    expect(spendKey(s, 'eastern-palace')).toBe(true);
    expect(spendKey(s, 'eastern-palace')).toBe(false); // none left
    expect(keyAvailable(s, 'eastern-palace')).toBe(false);
  });

  it('gates a smallkey requirement on the remaining key count', () => {
    const s = freshState();
    const req = [['smallkey:eastern-palace']];
    expect(requirementsMet(req, buildReachContext(s))).toBe(false);
    addKey(s, 'eastern-palace');
    expect(requirementsMet(req, buildReachContext(s))).toBe(true);
    spendKey(s, 'eastern-palace');
    expect(requirementsMet(req, buildReachContext(s))).toBe(false);
  });

  it('normalizes dungeon names and extracts them from key item names', () => {
    expect(canonicalDungeon("Thieves' Town")).toBe('thieves-town');
    expect(dungeonFromKeyItem('Small Key (Eastern Palace)')).toBe('eastern-palace');
    expect(dungeonFromKeyItem('Lamp')).toBeNull();
  });
});

describe('explorer — inventory → traversal tokens', () => {
  it('maps item names to reach tokens (Titan\'s Mitt implies light-rock lift)', () => {
    const s = freshState();
    applyItem(s, 'Titans Mitts');
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

  it('bumps the epoch and resets the frontier on a traversal-affecting item', () => {
    const s = freshState();
    s.frontier = ['B', 'C'];
    onCheckVerified(s, detected({ itemReceived: 'Hammer', matchedName: 'Kakariko Tavern' }));
    expect(s.epoch).toBe(1);
    expect(s.frontier).toHaveLength(0);
    expect(s.progressSinceEpoch).toBe(false);
    expect(s.completedChecks.has('Kakariko Tavern')).toBe(true);
  });

  it('marks done and continues (no epoch bump) on a non-traversal item', () => {
    const s = freshState();
    s.frontier = ['B'];
    onCheckVerified(s, detected({ itemReceived: '3 Bombs', matchedName: 'Chicken House' }));
    expect(s.epoch).toBe(0);
    expect(s.frontier).toEqual(['B']);
    expect(s.progressSinceEpoch).toBe(true);
    expect(s.completedChecks.has('Chicken House')).toBe(true);
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
    s.config = { goalCheckId: 'Ganon' };
    s.completedChecks.add('Ganon');
    expect(evaluateOutcome(s)).toBe('completed');
  });

  it('returns stopped-at-check when the stop flag is set', () => {
    const s = freshState();
    s.stopHit = true;
    expect(evaluateOutcome(s)).toBe('stopped-at-check');
  });
});
