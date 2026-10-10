/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { activeStates, SLOT } from '@rotp/game-core';
import type { StateSnapshot } from '@rotp/game-core';
import { required } from '../required';

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
    const state = required(activeStates(snap({}, 200))[0], 'first active state');
    expect(state.label).toBe('Follower #200 following');
    expect(state.detail).toBe('unmapped tagalong id');
  });

  it('holds several states at once, which is the whole point of a list', () => {
    const s = snap({ [SLOT.progressIndicator]: 2, [SLOT.bigKey]: 1, [SLOT.smallKeys]: 3 }, 1);
    expect(ids(s)).toEqual(['follower', 'progress-2', 'big-key', 'small-keys']);
  });

  it('pluralises the key count instead of saying "1 small keys"', () => {
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
    expect(ids(snap({ [SLOT.progressIndicator]: 9 }))).toEqual([]);
  });

  it('treats the 0xFF key sentinel as "no count", not 255 keys', () => {
    expect(ids(snap({ [SLOT.smallKeys]: 0xff }))).toEqual([]);
  });
});
