/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ScreenConnection } from '../../shared/game/types';
import type { SimChest, SimObservation, TriggerAction, FlagSnapshot, SimEvent, DetectedCheck } from '../../shared/game/simulation/types';
import { createEngine } from '../../shared/game/simulation/engine/engine';
import { createEngineState } from '../../shared/game/simulation/engine/state';
import type { EngineState } from '../../shared/game/simulation/engine/state';
import { buildAdjacency } from '../../shared/game/simulation/engine/traversal';
import { emptySnapshot, cloneSnapshot } from '../../shared/game/simulation/detect/flag-snapshot';
import { CHEST_OPEN_MASKS } from '../../shared/game/checks/flags';
import { ITEM_ID_TO_NAME } from '../../shared/game/items/id-map';

// ─── Synthetic world (3 screens, chests wired to real room IDs so the matcher names them) ───
// A — start; chest 0x103 (Kakariko Tavern) hands over the Hammer that unlocks B→C.
// B — empty corridor. C — chest 0x104 (Link's House) = the goal check.

const KAKARIKO_TAVERN_ROOM = 0x103;
const LINKS_HOUSE_ROOM = 0x104;
const HAMMER_ID = 0x09;
const LAMP_ID = 0x12;
const BOMBS_ID = 0x28;

interface WorldChest extends SimChest {
  screenId: string;
}

const makeConnections = (lockBToC: boolean): ScreenConnection[] => [
  { from: 'A', to: 'B', tags: ['transit:walk', 'dir:two-way'] },
  {
    from: 'B',
    to: 'C',
    tags: ['transit:door', 'dir:two-way'],
    nav: { transitType: 'door', requirements: lockBToC ? [['hammer']] : [], bidirectional: true, weight: 1 },
  },
];

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

const runLoop = (world: FakeWorld, connections: ScreenConnection[], goalCheckId?: string) => {
  const engine = createEngine({ adjacency: buildAdjacency(connections) });
  let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId });
  const events: string[] = [];
  for (let i = 0; i < 500 && state.phase !== 'done'; i++) {
    const obs = world.observe(state);
    const { actions, events: evs, nextState } = engine.step(state, obs);
    for (const a of actions) world.apply(a);
    for (const e of evs) events.push(e.msg);
    state = nextState;
  }
  return { state, events };
};

describe('simulation engine loop', () => {
  it('clears an item-gated world end-to-end and reports completed at the goal check', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const { state, events } = runLoop(world, makeConnections(true), 'Link\'s House');

    expect(state.phase).toBe('done');
    expect(state.outcome).toBe('completed');
    expect(state.completedChecks.has('Kakariko Tavern')).toBe(true);
    expect(state.completedChecks.has("Link's House")).toBe(true);
    // The Hammer pickup must have bumped the epoch (unlock-reset).
    expect(state.epoch).toBeGreaterThanOrEqual(1);
    expect(events.some(m => m.startsWith('Reset:'))).toBe(true);
  });

  it('re-floods from the current position after a traversal-affecting unlock', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const { state } = runLoop(world, makeConnections(true), 'Link\'s House');
    // Screen C is only reachable after the Hammer unlock — reaching it proves the re-flood.
    expect(state.reachedScreens.has('C')).toBe(true);
    expect(state.visited.has('C')).toBe(true);
  });

  it('reports not-completable when the frontier exhausts with the goal still gated', () => {
    // A gives only junk (no traversal effect); B→C stays hammer-locked forever.
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: BOMBS_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const { state } = runLoop(world, makeConnections(true), 'Link\'s House');

    expect(state.phase).toBe('done');
    expect(state.outcome).toBe('not-completable');
    expect(state.reachedScreens.has('C')).toBe(false);
    expect(state.completedChecks.has('Kakariko Tavern')).toBe(true);
  });

  it('stops exactly at a configured stop-at-check', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const engine = createEngine({ adjacency: buildAdjacency(makeConnections(true)) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { stopAtCheckId: 'Kakariko Tavern' });
    for (let i = 0; i < 500 && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, nextState } = engine.step(state, obs);
      for (const a of actions) world.apply(a);
      state = nextState;
    }
    expect(state.outcome).toBe('stopped-at-check');
    expect(state.completedChecks.has("Link's House")).toBe(false);
  });

  it('attaches the DetectedCheck to the "Verified …" event as its data payload', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const engine = createEngine({ adjacency: buildAdjacency(makeConnections(true)) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId: "Link's House" });
    const events: SimEvent[] = [];
    for (let i = 0; i < 500 && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, events: evs, nextState } = engine.step(state, obs);
      for (const a of actions) world.apply(a);
      events.push(...evs);
      state = nextState;
    }

    const verified = events.find(e => e.msg === 'Verified Kakariko Tavern');
    const detected = (verified?.data as { detected?: DetectedCheck } | undefined)?.detected;
    expect(detected?.matchedName).toBe('Kakariko Tavern');
  });
});
