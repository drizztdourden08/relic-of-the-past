/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ScreenConnection, CheckDefinition } from '../../shared/game/types';
import type {
  SimChest,
  SimObservation,
  TriggerAction,
  FlagSnapshot,
  DetectedCheck,
} from '../../shared/game/simulation/types';
import type { FloodFillResult } from '../../shared/game/navigation/types';
import { createEngine } from '../../shared/game/simulation/engine/engine';
import { createEngineState } from '../../shared/game/simulation/engine/state';
import type { EngineState, SimTarget } from '../../shared/game/simulation/engine/state';
import { buildAdjacency } from '../../shared/game/simulation/engine/traversal';
import { resetFrontier, onCheckVerified } from '../../shared/game/simulation/engine/explorer';
import { discoverTargets } from '../../shared/game/simulation/engine/discover';
import { emptySnapshot, cloneSnapshot } from '../../shared/game/simulation/detect/flag-snapshot';
import { CHEST_OPEN_MASKS } from '../../shared/game/checks/flags';
import { ITEM_ID_TO_NAME } from '../../shared/game/items/id-map';

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const KAKARIKO_TAVERN_ROOM = 0x103;
const LINKS_HOUSE_ROOM = 0x104;
const CHICKEN_HOUSE_ROOM = 0x108;
const BOMBS_ID = 0x28;
const LAMP_ID = 0x12;

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

const baseObs = (screenId: string, flags: FlagSnapshot): SimObservation => ({
  virtual: { screenId, tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: true, roomId: 0, owScreenIndex: 0 },
  inventory: new Set(),
  flags,
  interactables: { chests: [], sprites: [], doors: [] },
});

// ─── Finding 2: visited cleared on epoch reset ───────────────────────────────

describe('resetFrontier — epoch reset semantics', () => {
  it('clears visited and failed so everything is re-explored from here', () => {
    const s = freshState();
    s.visited = new Set(['A', 'B', 'C']);
    s.failed = new Set(['chest:0x1:0']);
    s.frontier = ['B'];
    s.progressSinceEpoch = true;

    resetFrontier(s);

    expect(s.epoch).toBe(1);
    expect(s.visited.size).toBe(0);
    expect(s.failed.size).toBe(0);
    expect(s.frontier).toHaveLength(0);
    expect(s.progressSinceEpoch).toBe(false);
  });
});

// ─── Finding 6: pass-through screens are observed mid-route ───────────────────

interface WorldChest extends SimChest {
  screenId: string;
}

class FakeWorld {
  flags: FlagSnapshot = emptySnapshot();
  inventory = new Set<string>();
  pendingItem: number | undefined;
  virtualScreen = 'A';

  constructor(private chests: WorldChest[]) {}

  private chestOpened(c: WorldChest): boolean {
    return (this.flags.dungInfo[c.roomId] & CHEST_OPEN_MASKS[c.chestIndex]) !== 0;
  }

  observe(state: EngineState): SimObservation {
    this.virtualScreen = state.virtual.screenId;
    const item = this.pendingItem;
    this.pendingItem = undefined;
    const chests = this.chests
      .filter(c => c.screenId === this.virtualScreen)
      .map(c => ({ ...c, opened: this.chestOpened(c) }));
    return {
      virtual: { screenId: this.virtualScreen, tile: { row: 0, col: 0 } },
      realLocation: { isIndoors: true, roomId: 0, owScreenIndex: 0 },
      inventory: new Set(this.inventory),
      flags: cloneSnapshot(this.flags),
      interactables: { chests, sprites: [], doors: [] },
      itemReceived: item,
    };
  }

  apply(action: TriggerAction): void {
    if (action.type !== 'chest') return;
    this.flags.dungInfo[action.roomId] |= CHEST_OPEN_MASKS[action.chestIndex];
    this.pendingItem = action.itemId;
    const name = ITEM_ID_TO_NAME[action.itemId];
    if (name) this.inventory.add(name);
  }
}

const CHAIN: ScreenConnection[] = [
  { from: 'A', to: 'B', tags: ['transit:walk', 'dir:two-way'] },
  { from: 'B', to: 'C', tags: ['transit:walk', 'dir:two-way'] },
];

describe('engine — pass-through screens get observed', () => {
  it('discovers and triggers an intermediate screen chest while routing past it', () => {
    const world = new FakeWorld([
      { screenId: 'B', roomId: CHICKEN_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: BOMBS_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const engine = createEngine({ adjacency: buildAdjacency(CHAIN) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId: "Link's House" });
    // Mark B as already visited so the frontier picks C directly and the route (A→B→C) passes through B.
    state.visited.add('B');

    for (let i = 0; i < 500 && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, nextState } = engine.step(state, obs);
      for (const a of actions) world.apply(a);
      state = nextState;
    }

    expect(state.phase).toBe('done');
    // The chest sitting on the pass-through screen B was observed and triggered.
    expect(state.done.has(`chest:${CHICKEN_HOUSE_ROOM}:0`)).toBe(true);
    expect(state.completedChecks.has('Chicken House')).toBe(true);
    expect(state.completedChecks.has("Link's House")).toBe(true);
  });
});

// ─── Finding 5: blocked-edge route abort (no teleport) ───────────────────────

describe('engine — traverse never teleports through a blocked edge', () => {
  it('aborts the route when the next hop has no passable edge', () => {
    // A→C is hammer-locked; a stale route to C exists but the virtual Link has no hammer.
    const conns: ScreenConnection[] = [
      {
        from: 'A',
        to: 'C',
        tags: ['transit:door', 'dir:two-way'],
        nav: { transitType: 'door', requirements: [['hammer']], bidirectional: true, weight: 1 },
      },
    ];
    const engine = createEngine({ adjacency: buildAdjacency(conns) });
    const state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});
    state.phase = 'traversing';
    state.route = ['C'];

    const { events, nextState } = engine.step(state, baseObs('A', emptySnapshot()));

    expect(nextState.virtual.screenId).toBe('A'); // did not move
    expect(nextState.route).toHaveLength(0);
    expect(nextState.phase).toBe('observing');
    expect(events.some(e => e.msg.includes('route aborted'))).toBe(true);
  });
});

// ─── Finding 10: unknown-position chest still discovered ──────────────────────

const unreachableFlood = { reachable: [[0]] } as unknown as FloodFillResult;

const makeChest = (posKnown: boolean, tile: { row: number; col: number }): SimChest => ({
  roomId: KAKARIKO_TAVERN_ROOM,
  chestIndex: 0,
  tile,
  posKnown,
  opened: false,
  itemId: BOMBS_ID,
});

describe('discover — unknown-position interactables', () => {
  it('discovers a posKnown=false chest even when its tile is unreachable', () => {
    const state = freshState();
    const obs = baseObs('A', emptySnapshot());
    obs.interactables = { chests: [makeChest(false, { row: 0xff, col: 0xff })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, unreachableFlood);
    expect(targets).toHaveLength(1);
  });

  it('drops a posKnown=true chest whose tile is unreachable', () => {
    const state = freshState();
    const obs = baseObs('A', emptySnapshot());
    obs.interactables = { chests: [makeChest(true, { row: 5, col: 5 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, unreachableFlood);
    expect(targets).toHaveLength(0);
  });

  // 2x2 large overworld areas pack the second screen's coordinates past the
  // first, so posKnown=true tiles can land outside the 64x64 flood grid.
  it('discovers a posKnown=true chest whose tile is outside the 64x64 flood grid', () => {
    const state = freshState();
    const obs = baseObs('A', emptySnapshot());
    obs.interactables = { chests: [makeChest(true, { row: 126, col: 20 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, unreachableFlood);
    expect(targets).toHaveLength(1);
  });
});

// ─── Finding 8: failed trigger (no diff) is not marked done, retried later ────

const target: SimTarget = {
  screenId: 'A',
  roomId: KAKARIKO_TAVERN_ROOM,
  action: { type: 'chest', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, itemId: BOMBS_ID },
  key: `chest:${KAKARIKO_TAVERN_ROOM}:0`,
  label: 'chest (test)',
};

describe('engine — failed trigger handling', () => {
  it('records a no-flag-change trigger as failed instead of done, then retries after an epoch reset', () => {
    const engine = createEngine({ adjacency: buildAdjacency(CHAIN) });
    const state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});
    state.phase = 'verifying';
    state.currentTarget = { ...target };
    state.preTrigger = emptySnapshot();

    // Post-trigger flags identical to pre-trigger → no diff → the trigger did nothing.
    const { nextState } = engine.step(state, baseObs('A', emptySnapshot()));

    expect(nextState.failed.has(target.key)).toBe(true);
    expect(nextState.done.has(target.key)).toBe(false);

    // Discovery skips a failed target this epoch …
    const obsWithChest = baseObs('A', emptySnapshot());
    obsWithChest.interactables = {
      chests: [{ roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, posKnown: true, opened: false, itemId: BOMBS_ID }],
      sprites: [],
      doors: [],
    };
    expect(discoverTargets(nextState, obsWithChest, null)).toHaveLength(0);

    // … but a future epoch clears `failed`, so it becomes discoverable again.
    resetFrontier(nextState);
    expect(discoverTargets(nextState, obsWithChest, null)).toHaveLength(1);
  });
});

// ─── Finding 9: generic small keys attributed via the matched check's dungeon ─

describe('explorer — generic key attribution', () => {
  const detected = (opts: Partial<DetectedCheck>): DetectedCheck => ({
    evidence: [],
    at: { screenId: 'A', tile: { row: 0, col: 0 } },
    ...opts,
  });

  it('attributes a suffix-less "Small Key" to the matched check\'s dungeon', () => {
    const s = freshState();
    const matched = { dungeon: 'Eastern Palace' } as CheckDefinition;
    onCheckVerified(s, detected({ itemReceived: 'Small Key', matched, matchedName: 'Eastern Palace - Big Chest' }));
    expect(s.keys.get('eastern-palace')).toBe(1);
  });

  it('attributes a suffix-less "Big Key" to the matched check\'s dungeon', () => {
    const s = freshState();
    const matched = { dungeon: "Thieves' Town" } as CheckDefinition;
    onCheckVerified(s, detected({ itemReceived: 'Big Key', matched, matchedName: "Thieves' Town - Big Key Chest" }));
    expect(s.bigKeys.has('thieves-town')).toBe(true);
  });
});
