/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { SimChest, SimSprite, SimObservation, FlagSnapshot } from '../../shared/game/simulation/types';
import type { PresenceGameState } from '../../shared/game/simulation/presence/state';
import { createEngineState } from '../../shared/game/simulation/engine/state';
import { discoverTargets, hasReachableOpenTile } from '../../shared/game/simulation/engine/discover';
import { emptySnapshot } from '../../shared/game/simulation/detect/flag-snapshot';

// A chest is a solid 2x2 (16px) block anchored at its top-left 8px tile; the game
// opens it only from the walkable tile directly below the footprint (two rows
// below the anchor), facing up. These cover the Link's House Lamp chest: stored
// at (54,56), footprint rows 54-55 both flood to blocked, and the open-from tile
// is (56,56) — not the (53,56) tile above, which is the wrong side.

const CHEST_ROOM = 0x104;

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

const baseObs = (flags: FlagSnapshot): SimObservation => ({
  virtual: { screenId: 'A', tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: true, roomId: 0, owScreenIndex: 0 },
  inventory: new Set(),
  flags,
  interactables: { chests: [], sprites: [], doors: [] },
});

const makeChest = (tile: { row: number; col: number }): SimChest => ({
  roomId: CHEST_ROOM,
  chestIndex: 0,
  tile,
  posKnown: true,
  opened: false,
  itemId: 0x12,
});

/** The detect flood's `reached` grid (booleans), written here as 0/1 for clarity. */
const floodFrom = (rows: number[][]): boolean[][] => rows.map((r) => r.map(Boolean));

/** A grid where only the tile two rows below `(r,c)` is reachable (left column). */
const openBelowLeft = (r: number, c: number): boolean[][] => {
  const rows: number[][] = [];
  for (let row = 0; row <= r + 2; row++) rows.push(new Array(c + 2).fill(0));
  rows[r + 2][c] = 1;
  return floodFrom(rows);
};

describe('hasReachableOpenTile', () => {
  it('is true when the tile two rows below the anchor (left column) is reachable', () => {
    expect(hasReachableOpenTile(openBelowLeft(0, 0), { row: 0, col: 0 })).toBe(true);
  });

  it('is true when the tile two rows below the anchor (right column) is reachable', () => {
    const flood = floodFrom([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ]);
    expect(hasReachableOpenTile(flood, { row: 0, col: 1 })).toBe(true);
  });

  it('is false when only a wrong-side neighbor (above/beside) is reachable', () => {
    // Tile above the chest and the chest body rows are reachable/blocked, but the
    // open-from row below is not — the chest must NOT count as openable.
    const flood = floodFrom([
      [0, 1, 0], // row above the anchor is reachable — wrong side
      [0, 0, 0], // anchor row
      [0, 0, 0], // chest body row
      [0, 0, 0], // open-from row: blocked
    ]);
    expect(hasReachableOpenTile(flood, { row: 1, col: 1 })).toBe(false);
  });
});

describe('discoverTargets — chest reachability uses the open-from tile below', () => {
  it('discovers a chest when the tile two rows below its anchor is reachable', () => {
    const flood = openBelowLeft(0, 0);
    const state = freshState();
    const obs = baseObs(emptySnapshot());
    obs.interactables = { chests: [makeChest({ row: 0, col: 0 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, flood);
    expect(targets).toHaveLength(1);
  });

  it('drops a chest when only the tile above it is reachable (wrong side)', () => {
    const flood = floodFrom([
      [0, 1, 0], // above the anchor — the wrong side, Link cannot open facing down
      [0, 0, 0], // anchor row
      [0, 0, 0], // chest body row
      [0, 0, 0], // open-from row below: blocked
    ]);
    const state = freshState();
    const obs = baseObs(emptySnapshot());
    obs.interactables = { chests: [makeChest({ row: 1, col: 1 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, flood);
    expect(targets).toHaveLength(0);
  });

  it('drops a chest fully surrounded by blocked tiles', () => {
    const flood = floodFrom([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    const state = freshState();
    const obs = baseObs(emptySnapshot());
    obs.interactables = { chests: [makeChest({ row: 1, col: 1 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, flood);
    expect(targets).toHaveLength(0);
  });
});

// ─── NPC room-aware matching + presence gating ─────────────────────────────────
// Sprites map to a check-giving NPC via CHECK_NPC_FLAGS by sprite type. A config
// that pins a `room` binds only in that room, so a type spawning in two rooms is
// disambiguated: sprite 0x73 = Link's Uncle, pinned to the secret passage 0x55 —
// the same 0x73 in Link's house intro room 0x104 must NOT match. Room-less
// configs match by type in any room and still honor their presence condition:
// 0x52 = King Zora (present iff Flippers unowned), 0x16 = Sahasrahla
// (unconditional), 0xEE = not a check NPC.

const HOUSE_ROOM = 0x104;
const PASSAGE_ROOM = 0x55;

const presenceWith = (partial: Partial<PresenceGameState> = {}): PresenceGameState => ({
  progressFlags: 0,
  progressIndicator: 0,
  progressIndicator3: 0,
  followerIndicator: 0,
  inventory: new Set<string>(),
  owEventInfo: [],
  roomState: [],
  ...partial,
});

const spriteObs = (sprite: SimSprite, presenceState: PresenceGameState): SimObservation => ({
  ...baseObs(emptySnapshot()),
  interactables: { chests: [], sprites: [sprite], doors: [] },
  presenceState,
});

const makeSprite = (spriteType: number, kind: SimSprite['kind'], roomId: number): SimSprite => ({
  roomId,
  spriteType,
  tile: { row: 0, col: 0 },
  posKnown: false, // coarse reachability — matching/presence, not tiles, is under test
  kind,
});

describe('discoverTargets — NPC room-aware matching', () => {
  it('matches Link\'s Uncle (0x73) in the secret passage room 0x55', () => {
    const obs = spriteObs(makeSprite(0x73, 'npc', PASSAGE_ROOM), presenceWith());
    expect(discoverTargets(freshState(), obs, null)).toHaveLength(1);
  });

  it('does NOT match the house uncle (0x73) in Link\'s house room 0x104', () => {
    const obs = spriteObs(makeSprite(0x73, 'npc', HOUSE_ROOM), presenceWith());
    expect(discoverTargets(freshState(), obs, null)).toHaveLength(0);
  });
});

describe('discoverTargets — NPC presence gating', () => {
  it('discovers a conditional room-less NPC when its condition holds (King Zora, no Flippers)', () => {
    const obs = spriteObs(makeSprite(0x52, 'npc', 0x181), presenceWith());
    expect(discoverTargets(freshState(), obs, null)).toHaveLength(1);
  });

  it('drops a conditional room-less NPC when its condition fails (King Zora, Flippers owned)', () => {
    const obs = spriteObs(makeSprite(0x52, 'npc', 0x181), presenceWith({ inventory: new Set(['item-031' as const]) }));
    expect(discoverTargets(freshState(), obs, null)).toHaveLength(0);
  });

  it('discovers the first sage once the pendant is in hand', () => {
    const obs = spriteObs(makeSprite(0x16, 'npc', 0x1ea), presenceWith({ inventory: new Set(['item-056' as const]) }));
    expect(discoverTargets(freshState(), obs, null)).toHaveLength(1);
  });

  it('drops the first sage before the pendant, and again once his gift is already held', () => {
    const before = spriteObs(makeSprite(0x16, 'npc', 0x1ea), presenceWith({ progressFlags: 0x10 }));
    expect(discoverTargets(freshState(), before, null)).toHaveLength(0);
    const after = spriteObs(makeSprite(0x16, 'npc', 0x1ea),
      presenceWith({ inventory: new Set(['item-056' as const, 'item-076' as const]) }));
    expect(discoverTargets(freshState(), after, null)).toHaveLength(0);
  });

  it('ignores a non-check sprite (no NPC config → no trigger)', () => {
    const obs = spriteObs(makeSprite(0xee, 'other', 0x104), presenceWith());
    expect(discoverTargets(freshState(), obs, null)).toHaveLength(0);
  });
});

// ─── Overworld sprites resolved to their true screen ───────────────────────
// A big (2x2) overworld area returns its whole sprite table however one of
// its screens is queried, each spawn already resolved to the screen it
// actually sits on (see getOverworldSprites / resolveAreaSprite). A target
// must be judged against the flood of the screen it is actually on, and must
// never be offered for a screen it does not belong to.

const HEAD_SCREEN = 24;
const SOUTH_SCREEN = HEAD_SCREEN + 8;

const owSprite = (roomId: number, tile: { row: number; col: number }): SimSprite => ({
  roomId,
  outdoor: true,
  spriteType: 0x00,
  tile,
  posKnown: true,
  kind: 'overworld',
  itemId: 0x01,
});

const owObs = (owScreenIndex: number, sprites: SimSprite[]): SimObservation => ({
  ...baseObs(emptySnapshot()),
  virtual: { screenId: `ow:${owScreenIndex}`, tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: false, roomId: 0, owScreenIndex },
  interactables: { chests: [], sprites, doors: [] },
});

/** Traversal is virtual, so which screen is being observed comes from the run's own
 *  position, never from where the game physically sits. */
const owState = (owScreenIndex: number) =>
  createEngineState({ screenId: `ow:${owScreenIndex}`, tile: { row: 0, col: 0 } }, new Set(), {});

/** A flood grid reachable everywhere within the given bounds. */
const allReachable = (rows: number, cols: number): boolean[][] =>
  Array.from({ length: rows }, () => new Array(cols).fill(true));

describe('discoverTargets — overworld sprites resolved to their true screen', () => {
  it('discovers a sprite normally when it belongs to the observed screen', () => {
    const obs = owObs(HEAD_SCREEN, [owSprite(HEAD_SCREEN, { row: 20, col: 12 })]);
    expect(discoverTargets(owState(HEAD_SCREEN), obs, allReachable(64, 64))).toHaveLength(1);
  });

  it('does not offer a sprite resolved to a neighbouring screen as a target for the observed one', () => {
    // Resolved to the screen one row south of the head — belongs to SOUTH_SCREEN,
    // not the head screen this observation is for. The flood is fully
    // reachable, so only the screen mismatch can be excluding it.
    const obs = owObs(HEAD_SCREEN, [owSprite(SOUTH_SCREEN, { row: 20, col: 12 })]);
    expect(discoverTargets(owState(HEAD_SCREEN), obs, allReachable(64, 64))).toHaveLength(0);
  });

  it('offers that same sprite once its own screen is the one being observed', () => {
    const obs = owObs(SOUTH_SCREEN, [owSprite(SOUTH_SCREEN, { row: 20, col: 12 })]);
    expect(discoverTargets(owState(SOUTH_SCREEN), obs, allReachable(64, 64))).toHaveLength(1);
  });
});

describe('discoverTargets — posKnown === false fallback', () => {
  it('discovers an unknown-position interactable regardless of a real, unrelated flood grid', () => {
    const sprite: SimSprite = {
      roomId: 0x181,
      spriteType: 0x00,
      tile: { row: 999, col: 999 }, // far outside any real grid
      posKnown: false,
      kind: 'standing',
      itemId: 0x01,
    };
    const obs: SimObservation = { ...baseObs(emptySnapshot()), interactables: { chests: [], sprites: [sprite], doors: [] } };
    expect(discoverTargets(freshState(), obs, allReachable(4, 4))).toHaveLength(1);
  });
});
