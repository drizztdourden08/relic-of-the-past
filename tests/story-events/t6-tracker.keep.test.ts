/* @layer test @kind spec */
/**
 * T6: the tracker's event records resolve from a synthetic heap: ledger bits, vanilla bits,
 * the derived pass (held items, all-of, a dungeon's own records), the older-file fallbacks.
 * Pure functions, no game.
 */
import { describe, expect, it } from 'vitest';
import { all } from '@shared/game/data';
import type { CheckRecord, ItemId } from '@shared/game/data';
import { computeCompletedChecks } from '@app/lib/game/tracker/completed-checks-core';
import type { ProgressReaders } from '@app/lib/game/tracker/completed-checks-core';
import { EVENT_BIT } from '@shared/game/data/records/checks/events/event-bits';
import { computeEventStatus } from '@app/lib/game/tracker/event-status';
import { buildPresenceState } from '@shared/game/simulation/presence/state';

const events = (): CheckRecord[] => all('check').filter((c) => c.kind === 'event');
const byName = (name: string): CheckRecord => {
  const found = all('check').find((c) => c.randomizerName === name);
  if (!found) throw new Error(`no record named ${name}`);
  return found;
};

interface Heap { rooms: Map<number, number>; ow: Map<number, number>; prog: Map<number, number>; ledger: Set<number>; inventory: Set<ItemId> }
const heap = (): Heap => ({ rooms: new Map(), ow: new Map(), prog: new Map(), ledger: new Set(), inventory: new Set() });
const readersOf = (h: Heap): ProgressReaders => ({
  readRoomWord: (room) => h.rooms.get(room) ?? 0,
  readOwByte: (screen) => h.ow.get(screen) ?? 0,
  readProgByte: (index) => h.prog.get(index) ?? 0,
  readEventByte: (byte) => { let v = 0; for (let b = 0; b < 8; b += 1) if (h.ledger.has(byte * 8 + b)) v |= 1 << b; return v; },
  inventory: h.inventory,
});
const sweep = (h: Heap) => computeCompletedChecks(readersOf(h), () => false);

describe('T6: event records', () => {
  it('are unique, in range, and every combined event names records that exist', () => {
    const ids = new Set<string>();
    const known = new Set(all('check').map((c) => c.id));
    for (const record of events()) {
      expect(ids.has(record.id), `duplicate ${record.id}`).toBe(false);
      ids.add(record.id);
      if (record.gameId.eventBit !== undefined) expect(record.gameId.eventBit).toBeLessThanOrEqual(EVENT_BIT.floodgatePulled);
      const named: string[] = [];
      const walk = (req: unknown): void => {
        if (!req || typeof req !== 'object') return;
        const r = req as Record<string, unknown>;
        if (typeof r.checkId === 'string') named.push(r.checkId);
        for (const key of ['allOf', 'anyOf']) if (Array.isArray(r[key])) (r[key] as unknown[]).forEach(walk);
      };
      walk(record.derived); walk(record.fallback);
      for (const id of named) expect(known.has(id), `${record.id} names ${id}`).toBe(true);
    }
    expect(ids.size).toBeGreaterThan(200);
  });

  it('a blank heap completes no event', () => {
    const done = sweep(heap());
    expect(events().some((e) => done.has(e.id))).toBe(false);
  });

  it('ledger bits and vanilla bits each complete their record', () => {
    const h = heap();
    h.ledger.add(EVENT_BIT.oldManRescued);
    h.ow.set(0x80, 0x40);
    h.prog.set(0, 3);
    const done = sweep(h);
    expect(done.has(byName('Old Man rescued').id)).toBe(true);
    expect(done.has(byName('Master Sword pulled').id)).toBe(true);
    expect(done.has(byName('Agahnim 1 beaten').id)).toBe(true);
    expect(done.has(byName('Dark World reached').id)).toBe(true);
    expect(done.has(byName('Ganon beaten').id)).toBe(false);
  });

  it('a boss falls back to the heart on a file older than the ledger', () => {
    const h = heap();
    h.rooms.set(0x07, 0x800);
    const done = sweep(h);
    expect(done.has(byName('Tower of Hera: heart container taken').id)).toBe(true);
    expect(done.has(byName('Tower of Hera: Moldorm beaten').id)).toBe(true);
    expect(done.has(byName('Tower of Hera: reward taken').id)).toBe(false);
    h.inventory.add('item-111' as ItemId);
    const withPendant = sweep(h);
    expect(withPendant.has(byName('Tower of Hera: reward taken').id)).toBe(true);
    expect(withPendant.has(byName('Pendant of Wisdom held').id)).toBe(true);
  });

  it('held items and the combined events follow the inventory', () => {
    const h = heap();
    for (const id of ['item-109', 'item-110', 'item-111']) h.inventory.add(id as ItemId);
    const done = sweep(h);
    expect(done.has(byName('All pendants held').id)).toBe(true);
    expect(done.has(byName('All crystals held').id)).toBe(false);
  });

  it('a reversible event reports its live status without unticking', () => {
    const state = buildPresenceState({
      progress: [0, 0, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12],
      owEventInfo: Object.assign(new Array<number>(0x82).fill(0), { 0x3b: 0x20 }),
      roomState: [],
      inventory: new Set<ItemId>(),
    });
    const status = computeEventStatus(state);
    expect(status.get(byName('Floodgate lever pulled').id)).toBe(true);
    expect(status.get(byName('Dark Blacksmith Ruins').id)).toBe(true);
    expect(status.get(byName('Kiki hired').id)).toBe(false);
    expect(status.has(byName('Ganon beaten').id)).toBe(false);
  });

  it('a dungeon is cleared when its own records are', () => {
    const hera = all('check').filter((c) => c.dungeonId === 'dungeon-005' && c.kind !== 'event');
    expect(hera.length).toBeGreaterThan(0);
    const h = heap();
    for (const c of hera) {
      const { roomId, chestIndex, mask } = c.gameId;
      if (roomId === undefined) continue;
      const bit = chestIndex !== undefined ? [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400][chestIndex] : (mask ?? 0);
      h.rooms.set(roomId, (h.rooms.get(roomId) ?? 0) | bit);
    }
    h.rooms.set(0x07, (h.rooms.get(0x07) ?? 0) | 0x800);
    h.rooms.set(0x31, (h.rooms.get(0x31) ?? 0) | 0x8000);
    h.ledger.add(EVENT_BIT.bossKilled(10));
    h.ledger.add(EVENT_BIT.prizeTaken(10));
    const done = sweep(h);
    expect(done.has(byName('Tower of Hera: all chests opened').id)).toBe(true);
    expect(done.has(byName('Tower of Hera: all keys collected').id)).toBe(true);
    expect(done.has(byName('Tower of Hera: cleared').id)).toBe(true);
    expect(done.has(byName('All Light World dungeons cleared').id)).toBe(false);
  });
});
