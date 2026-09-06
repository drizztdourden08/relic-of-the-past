/* @layer tests @kind test */
import { describe, it, expect, afterAll } from 'vitest';
import type { ConnectionRecord } from '../../shared/game/data';
import type { SimChest, SimObservation, TriggerAction, FlagSnapshot, SimEvent, DetectedCheck } from '../../shared/game/simulation/types';
import { createEngine } from '../../shared/game/simulation/engine/engine';
import { createEngineState } from '../../shared/game/simulation/engine/state';
import type { EngineState } from '../../shared/game/simulation/engine/state';
import { buildAdjacency } from '../../shared/game/simulation/engine/traversal';
import { emptySnapshot, cloneSnapshot } from '../../shared/game/simulation/detect/flag-snapshot';
import { getItemByGameId, registerRecord, unregisterRecord } from '../../shared/game/data';
import type { CheckId, ConnectionId, ItemId } from '../../shared/game/data';
import { describeDataset } from '../dataset-guard';

/** Chest-open bit per slot, taken from the same native fact the matcher uses. */
const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400] as const;

// Synthetic world (3 screens, chests wired to real room IDs so the matcher names them)
// A is the start; chest 0x103 (Kakariko Tavern) hands over the Hammer that unlocks B→C.
// B is an empty corridor. C holds chest 0x104 (Link's House), the goal check.

const KAKARIKO_TAVERN_ROOM = 0x103;
const LINKS_HOUSE_ROOM = 0x104;
/** The checks those two chests ARE. Identity is the id, not the display name. */
const TAVERN_CHECK: CheckId = 'check-027';
const HOUSE_CHECK: CheckId = 'check-026';
const HAMMER_ID = 0x09;
const LAMP_ID = 0x12;
const BOMBS_ID = 0x28;

interface WorldChest extends SimChest {
  screenId: string;
}

const EMPTY_PLACEMENT = { form: 'area' as const, tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } };

/**
 * A one-sided point resolves its partner through the GLOBAL facade
 * (`toScreenIdOf` calls `getConnection`), not the array `buildAdjacency` was
 * handed, so this world's points are registered in the real session registry.
 * `lockBToC` is always `true` here; both directions of the B<->C door carry
 * the same hammer requirement.
 */
const CONNECTION_IDS = ['connection-t01', 'connection-t01r', 'connection-t02', 'connection-t02r'] as ConnectionId[];

const makeConnections = (lockBToC: boolean): ConnectionRecord[] => {
  const doorReq = lockBToC ? [['hammer']] : [];
  const records = [
    {
      id: 'connection-t01', screenId: 'A', toConnectionId: 'connection-t01r', kind: 'edge',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:walk'],
    },
    {
      id: 'connection-t01r', screenId: 'B', toConnectionId: 'connection-t01', kind: 'edge',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:walk'],
    },
    {
      id: 'connection-t02', screenId: 'B', toConnectionId: 'connection-t02r', kind: 'door',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:door'],
      nav: { transitType: 'door', requirements: doorReq, weight: 1 },
    },
    {
      id: 'connection-t02r', screenId: 'C', toConnectionId: 'connection-t02', kind: 'door',
      placement: EMPTY_PLACEMENT, canExit: true, tags: ['transit:door'],
      nav: { transitType: 'door', requirements: doorReq, weight: 1 },
    },
  ] as unknown as ConnectionRecord[];
  for (const record of records) {
    if (!registerRecord('connection', record)) {
      unregisterRecord('connection', record.id);
      registerRecord('connection', record);
    }
  }
  return records;
};

class FakeWorld {
  flags: FlagSnapshot = emptySnapshot();
  inventory = new Set<ItemId>();
  pendingItem: ItemId | undefined;
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
    const item = getItemByGameId({ receiveItemId: action.itemId });
    this.pendingItem = item?.id;
    if (item) this.inventory.add(item.id);
  }
}

const runLoop = (world: FakeWorld, connections: ConnectionRecord[], goalCheckId?: CheckId) => {
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

describeDataset('simulation engine loop', () => {
  afterAll(() => {
    for (const id of CONNECTION_IDS) unregisterRecord('connection', id);
  });

  it('clears an item-gated world end-to-end and reports completed at the goal check', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const { state, events } = runLoop(world, makeConnections(true), HOUSE_CHECK);

    expect(state.phase).toBe('done');
    expect(state.outcome).toBe('completed');
    expect(state.completedChecks.has(TAVERN_CHECK)).toBe(true);
    expect(state.completedChecks.has(HOUSE_CHECK)).toBe(true);
    // The Hammer pickup must have bumped the epoch (unlock-reset).
    expect(state.epoch).toBeGreaterThanOrEqual(1);
    expect(events.some(m => m.startsWith('Reset:'))).toBe(true);
  });

  it('re-floods from the current position after a traversal-affecting unlock', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const { state } = runLoop(world, makeConnections(true), HOUSE_CHECK);
    // Screen C is only reachable after the Hammer unlock, so reaching it proves the re-flood.
    expect(state.reachedScreens.has('C')).toBe(true);
    expect(state.visited.has('C')).toBe(true);
  });

  it('reports not-completable when the frontier exhausts with the goal still gated', () => {
    // A gives only junk (no traversal effect); B→C stays hammer-locked forever.
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: BOMBS_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const { state } = runLoop(world, makeConnections(true), HOUSE_CHECK);

    expect(state.phase).toBe('done');
    expect(state.outcome).toBe('not-completable');
    expect(state.reachedScreens.has('C')).toBe(false);
    expect(state.completedChecks.has(TAVERN_CHECK)).toBe(true);
  });

  it('stops exactly at a configured stop-at-check', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const engine = createEngine({ adjacency: buildAdjacency(makeConnections(true)) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { stopAtCheckId: TAVERN_CHECK });
    for (let i = 0; i < 500 && state.phase !== 'done'; i++) {
      const obs = world.observe(state);
      const { actions, nextState } = engine.step(state, obs);
      for (const a of actions) world.apply(a);
      state = nextState;
    }
    expect(state.outcome).toBe('stopped-at-check');
    expect(state.completedChecks.has(HOUSE_CHECK)).toBe(false);
  });

  it('attaches the DetectedCheck to the "Verified ..." event as its data payload', () => {
    const world = new FakeWorld([
      { screenId: 'A', roomId: KAKARIKO_TAVERN_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: HAMMER_ID },
      { screenId: 'C', roomId: LINKS_HOUSE_ROOM, chestIndex: 0, tile: { row: 0, col: 0 }, opened: false, posKnown: true, itemId: LAMP_ID },
    ]);
    const engine = createEngine({ adjacency: buildAdjacency(makeConnections(true)) });
    let state = createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), { goalCheckId: HOUSE_CHECK });
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
    expect(detected?.checkId).toBe(TAVERN_CHECK);
  });
});
