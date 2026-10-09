/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/game/randomizer-client/online-client';
import { roomHashOf } from '@rotp/randomizer';
import { ROOM_MISMATCH } from '@rotp/randomizer';
import { createFakeServer } from '../ap-fake-server';
import type { FakeRoom } from '../ap-fake-server';
import { createFakeCore } from '../ap-fake-core';
import type { FakeCore } from '../ap-fake-core';
import { OWN, item, settle } from '../ap-protocol-harness';
import { installRecoveryHarness } from './install-recovery-harness';
import { recoveryRoom as makeRoom } from './recovery-room';

const logged = vi.hoisted(() => [] as string[]);

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  const randomizer = (message: string): void => { logged.push(message); };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const bootWith = async (room: FakeRoom, prepare: (core: FakeCore) => void = () => undefined) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  prepare(core);
  const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
  await session.start();
  await settle();
  return { server, core, session };
};

const names = (core: FakeCore): string[] => core.delivered.map((d) => d.itemName);

installRecoveryHarness();

describe('received items and the save file', () => {
  const five = () => [100, 101, 100, 101, 100].map((id) => item(id, 2, 900));

  it('delivers nothing and keeps the index while no file is in play, then asks once one is', async () => {
    const { server, core } = await bootWith(makeRoom({ items: five().slice(0, 2) }), (c) => { c.inPlay = false; });
    expect([names(core), core.index, server.of('Sync').length]).toEqual([[], 0, 0]);
    core.setInPlay(true);
    await settle();
    expect([names(core), core.index, server.of('Sync').length]).toEqual([['Bow', 'Hookshot'], 2, 1]);
  });

  it('moves the index only when the game grants, never at queue time, and queues nothing twice', async () => {
    const { server, core } = await bootWith(makeRoom({ items: five().slice(0, 2) }), (c) => { c.holdGrants = true; });
    expect([core.queued.length, core.index]).toEqual([2, 0]);
    server.push([{ cmd: 'ReceivedItems', index: 0, items: five().slice(0, 2) }]);
    await settle();
    expect(core.queued.length).toBe(2);
    core.grantNext();
    expect(core.index).toBe(1);
    core.grantNext();
    expect([names(core), core.index]).toEqual([['Bow', 'Hookshot'], 2]);
  });

  it('a state loaded from before three items receives exactly those three again (T7)', async () => {
    const { server, core } = await bootWith(makeRoom({ items: five() }));
    expect([names(core).length, core.index]).toEqual([5, 5]);
    core.index = 2;
    core.swapSave();
    await settle();
    expect(server.of('Sync')).toHaveLength(1);
    expect(names(core).slice(5)).toEqual(['Bow', 'Hookshot', 'Bow']);
    expect([core.index, core.cancels]).toEqual([5, 1]);
  });

  it('a swap withdraws what the queue still held for the save that is gone', async () => {
    const { core } = await bootWith(makeRoom({ items: five().slice(0, 2) }), (c) => { c.holdGrants = true; });
    core.grantNext();
    core.swapSave();
    await settle();
    expect([core.cancels, core.queued.map((q) => q.itemName)]).toEqual([1, ['Hookshot']]);
    core.grantNext();
    core.grantNext();
    expect([names(core), core.index, core.queued.length]).toEqual([['Bow', 'Hookshot'], 2, 0]);
  });

  it('binds a fresh save to the room on its first grant, and refuses a save of another room', async () => {
    const fresh = await bootWith(makeRoom({ items: five().slice(0, 1), seedName: 'seed-A' }));
    expect([names(fresh.core), fresh.core.roomHash]).toEqual([['Bow'], roomHashOf('seed-A')]);

    const same = await bootWith(makeRoom({ items: five().slice(0, 1), seedName: 'seed-A' }), (c) => { c.roomHash = roomHashOf('seed-A'); });
    expect([names(same.core), same.session.status]).toEqual([['Bow'], 'active']);

    logged.length = 0;
    const other = await bootWith(makeRoom({ items: five().slice(0, 1), seedName: 'seed-B' }), (c) => { c.roomHash = roomHashOf('seed-A'); });
    expect([names(other.core), other.core.index, other.session.status]).toEqual([[], 0, 'error']);
    expect(other.core.roomHash).toBe(roomHashOf('seed-A'));
    expect(logged).toContain(ROOM_MISMATCH);
    expect(ROOM_MISMATCH).toContain('This save belongs to another Archipelago room');
  });
});

describe('the room\'s checked locations', () => {
  const twoChecks = (): Partial<FakeRoom> => ({
    games: {
      [OWN]: {
        item_name_to_id: { Bow: 100, Hookshot: 101 }, location_name_to_id: { 'check-001': 1, 'check-002': 2 }, checksum: 'own-2',
      },
    },
    checked: [1],
    missing: [2],
  });

  it('marks the connect\'s and every room update\'s checks collected, and never reports them', async () => {
    const { server, core } = await bootWith(makeRoom(twoChecks()), (c) => { c.localComplete = new Set(['check-001']); });
    expect([...core.collected]).toEqual(['check-001']);
    server.push([{ cmd: 'RoomUpdate', checked_locations: [2] }]);
    await settle();
    expect([...core.collected]).toEqual(['check-001', 'check-002']);
    core.localComplete.add('check-002');
    server.drop();
    await settle();
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(server.of('LocationChecks')).toHaveLength(0);
  });
});
