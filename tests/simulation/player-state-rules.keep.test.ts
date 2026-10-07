/* @layer tests @kind test */
/**
 * The live-player-state chips. These assert STRINGS, not bytes. The sleep case
 * bit us: `player_sleep_in_bed_state` is a step counter INSIDE the sleeping
 * handler and reads 0 while asleep, so an earlier version reported "Asleep in
 * bed" in every save. Asleep comes from the handler state now.
 */
import { describe, it, expect } from 'vitest';
import { playerStates, PlayerState } from '../../apps/web/src/lib/game/player-state-rules';
import type { PlayerStateInfo } from '../../apps/web/src/lib/game/bridge/player-state';

const info = (over: Partial<PlayerStateInfo> = {}): PlayerStateInfo => ({
  handlerState: PlayerState.ground,
  sleepStep: 0,
  isRunning: false,
  isBunny: false,
  inDeepWater: false,
  grabbingWall: false,
  progressFlags: 0,
  incapacitated: false,
  ...over,
});

const labels = (i: PlayerStateInfo | null): string[] => playerStates(i).map((s) => s.label);

describe('player activity states', () => {
  it('says nothing while Link just stands on the ground', () => {
    expect(playerStates(info())).toEqual([]);
  });

  it('reports asleep from the handler state, not the step counter', () => {
    expect(labels(info({ handlerState: PlayerState.asleepInBed }))).toEqual(['Asleep in bed']);
  });

  it('distinguishes waking up from being asleep', () => {
    const states = playerStates(info({ handlerState: PlayerState.asleepInBed, sleepStep: 3 }));
    expect(states[0].label).toBe('Waking up in bed');
    expect(states[0].detail).toBe('wake step 3');
  });

  it('does NOT claim asleep just because the step counter is set', () => {
    // The counter is stale garbage outside the sleeping handler.
    expect(labels(info({ handlerState: PlayerState.ground, sleepStep: 5 }))).toEqual([]);
  });

  it('names the activities a reader would recognise', () => {
    expect(labels(info({ handlerState: PlayerState.swimming }))).toEqual(['Swimming']);
    expect(labels(info({ handlerState: PlayerState.hookshot }))).toEqual(['Using the hookshot']);
    expect(labels(info({ handlerState: PlayerState.holdUpItem }))).toEqual(['Holding an item overhead']);
  });

  it('stays quiet for an unnamed handler state instead of printing a number', () => {
    expect(labels(info({ handlerState: 99 }))).toEqual([]);
  });
});

describe('traversal-affecting states', () => {
  it('reports dashing, and flags it as affecting reach', () => {
    const states = playerStates(info({ isRunning: true }));
    expect(states[0].label).toBe('Dashing (boots)');
    expect(states[0].gating).toBe(true);
  });

  it('explains what bunny form costs instead of just naming it', () => {
    expect(labels(info({ isBunny: true }))).toEqual(['Bunny - cannot use items']);
  });

  it('reports deep water and wall grabbing', () => {
    expect(labels(info({ inDeepWater: true }))).toEqual(['In deep water']);
    expect(labels(info({ grabbingWall: true }))).toEqual(['Grabbing a wall']);
  });

  it('combines an activity with the flags that hold alongside it', () => {
    expect(labels(info({ handlerState: PlayerState.swimming, inDeepWater: true, isRunning: true })))
      .toEqual(['Swimming', 'Dashing (boots)', 'In deep water']);
  });
});

describe('progress flag bits', () => {
  it('names each set bit and shows its mask so a label can be checked', () => {
    const states = playerStates(info({ progressFlags: 0x01 }));
    expect(states[0].label).toBe('Uncle gave the sword');
    expect(states[0].hint).toBe('sram_progress_flags 0x01');
    // Provenance stays out of the visible chip.
    expect(states[0].detail).toBeUndefined();
  });

  it('reports every set bit, not just the first', () => {
    expect(labels(info({ progressFlags: 0x01 | 0x04 | 0x20 }))).toEqual([
      'Uncle gave the sword', 'Uncle left for the castle', 'Desert sage spoken to',
    ]);
  });

  it('ignores bits the game never sets', () => {
    expect(labels(info({ progressFlags: 0x08 | 0x40 | 0x80 }))).toEqual([]);
  });
});

describe('no player state available', () => {
  it('returns an empty list instead of throwing when the module is not running', () => {
    expect(playerStates(null)).toEqual([]);
  });
});
