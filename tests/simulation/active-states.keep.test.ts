/* @layer tests @kind test */
/**
 * The widget's "States" row. Several states hold at once, so the registry must
 * return a LIST — the original code answered one boolean question ("is the
 * princess following") and nothing else was visible.
 *
 * Names come from the routine that sets each tagalong id in the decompilation; an
 * id with no confirmed source must be reported by number, never guessed at.
 */
import { describe, it, expect } from 'vitest';
import { activeStates, SLOT } from '../../apps/web/src/lib/game/active-states';
import type { StateSnapshot } from '../../apps/web/src/lib/game/active-states';

const snap = (over: Partial<Record<number, number>> = {}, follower = 0): StateSnapshot => {
  const progress = new Array(16).fill(0);
  for (const [k, v] of Object.entries(over)) progress[Number(k)] = v;
  progress[SLOT.follower] = follower;
  return { follower, progress };
};

const ids = (s: StateSnapshot): string[] => activeStates(s).map((a) => a.id);
const labels = (s: StateSnapshot): string[] => activeStates(s).map((a) => a.label);

describe('active game states', () => {
  it('reports nothing when nothing notable holds', () => {
    expect(activeStates(snap())).toEqual([]);
  });

  it('names the princess as the follower', () => {
    expect(labels(snap({}, 1))).toContain('Princess following');
  });

  it('names the other tagalongs the game can hand Link', () => {
    expect(labels(snap({}, 4))).toContain('Old Man following');
    expect(labels(snap({}, 7))).toContain("Blacksmith's frog following");
    expect(labels(snap({}, 10))).toContain('Kiki following');
  });

  it('reports an unmapped tagalong id by number instead of guessing', () => {
    const state = activeStates(snap({}, 200))[0];
    expect(state.label).toBe('Follower #200 following');
    expect(state.detail).toBe('unmapped tagalong id');
  });

  it('holds several states at once — the whole point of a list', () => {
    // Progress BITS come from the live player-state bytes, not this buffer, so
    // they are asserted in player-state-rules.test.ts instead.
    const s = snap({ [SLOT.progressIndicator]: 2, [SLOT.bigKey]: 1, [SLOT.smallKeys]: 3 }, 1);
    expect(ids(s)).toEqual(['follower', 'progress-2', 'big-key', 'small-keys']);
  });

  it('pluralises the key count rather than saying "1 small keys"', () => {
    expect(labels(snap({ [SLOT.smallKeys]: 1 }))).toContain('1 small key');
    expect(labels(snap({ [SLOT.smallKeys]: 4 }))).toContain('4 small keys');
  });

  it('flags the states that change what is reachable', () => {
    const gating = activeStates(snap({ [SLOT.bigKey]: 1, [SLOT.smallKeys]: 2 }, 1))
      .filter((a) => a.gating).map((a) => a.id);
    expect(gating).toEqual(['follower', 'big-key', 'small-keys']);
  });

  it('names the story beats the progress indicator counts off', () => {
    expect(labels(snap({ [SLOT.progressIndicator]: 1 }))).toContain('Sword received');
    expect(labels(snap({ [SLOT.progressIndicator]: 2 }))).toContain('Princess delivered');
    // An unmapped tier must not invent a beat.
    expect(ids(snap({ [SLOT.progressIndicator]: 9 }))).toEqual([]);
  });

  // link_num_keys is 0xFF outside a dungeon, which once rendered as "255 small keys".
  it('treats the 0xFF key sentinel as "no count", not 255 keys', () => {
    expect(ids(snap({ [SLOT.smallKeys]: 0xff }))).toEqual([]);
  });
});
