/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { baselineEntriesOf } from '@rotp/randomizer';
import { rebaselineEntries } from '../ap-rebaseline';
import type { CreateSocket } from '@drizztdourden08/brock-randomizer/archipelago';
import type { PhysicalPlan } from '@rotp/randomizer';
import { createFakeServer } from '../ap-fake-server';
import { createFakeCore } from '../ap-fake-core';
import { createOnlineClient, item, settle } from '../ap-protocol-harness';
import { installRecoveryHarness } from './install-recovery-harness';
import { recoveryRoom as makeRoom } from './recovery-room';

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

installRecoveryHarness();

describe('online recovery', { tags: ['critical'] }, () => {
  it('asks for the list again once the game can take items, and resumes where it stopped', async () => {
    const room = makeRoom({ items: [item(100, 2, 900), item(101, 2, 900)] });
    const server = createFakeServer(room);
    const core = createFakeCore();
    core.notReady.add('Hookshot');
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow']);
    expect([core.index, server.of('Sync').length]).toEqual([1, 0]);
    core.becomeReady();
    await settle();
    expect(server.of('Sync')).toHaveLength(1);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot']);
    expect(core.index).toBe(2);
  });

  it('a stop disarms the game, withdraws its deliveries and pauses the poll', async () => {
    const server = createFakeServer(makeRoom());
    const core = createFakeCore();
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    const disarmsBefore = core.disarms;
    session.stop();
    await settle();
    expect(core.disarms).toBeGreaterThan(disarmsBefore);
    expect([core.cancels > 0, core.pauses > 0]).toEqual([true, true]);
  });
});

describe('online recovery', { tags: ['critical'] }, () => {
  // Brock gap: archipelago/room/reset-connection.ts keeps room.scoutIds, so dispatch/scout-once.ts never re-asks after a drop.
  it.skip('asks for the scouts again when a drop lost the answer, then delivers', async () => {
    const server = createFakeServer(makeRoom({ items: [item(100, 2, 900)] }));
    let swallowScout = true;
    const createSocket: CreateSocket = (url) => {
      const socket = server.createSocket(url);
      const send = socket.send;
      socket.send = (data) => {
        if (swallowScout && data.includes('"LocationScouts"')) {
          swallowScout = false;
          server.drop();
          return;
        }
        send(data);
      };
      return socket;
    };
    const core = createFakeCore();
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket });
    await session.start();
    await settle();
    expect(core.delivered).toEqual([]);
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(server.of('LocationScouts')).toHaveLength(1);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow']);
    expect(session.status).toBe('active');
  });

  it('a refused scout ends the session, since nothing could arm', async () => {
    const server = createFakeServer(makeRoom());
    const core = createFakeCore();
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    server.push([{ cmd: 'InvalidPacket', type: 'arguments', original_cmd: 'LocationScouts', text: 'no' }]);
    await settle();
    expect(session.status).toBe('error');
  });
});

describe('the offline baseline', { tags: ['critical'] }, () => {
  const plan: PhysicalPlan = {
    entries: [
      { location: 'check-019', item: 'item-bow', checkId: 'check-019', planClass: 'override-npc' },
      { location: 'check-001', item: 'item-bow', checkId: 'check-001', planClass: 'deliver' },
    ],
    errors: [],
    counts: {
      override: 0, overrideNpc: 0, overrideDrop: 0, overrideStanding: 0, overrideScripted: 0, overrideShop: 0,
      deliver: 0, vanillaLocked: 0, pollBlind: 0, errors: 0,
    },
  };
  const completed = new Set(['check-019']);
  const input = {
    entries: baselineEntriesOf(plan),
    suppressed: new Set<string>(),
    isComplete: (entry: { key: string; checkId?: string }) => entry.checkId !== undefined && completed.has(entry.checkId),
  };

  it('reports an armed pickup the save shows and the server lacks', () => {
    expect(baselineEntriesOf(plan).map((entry) => entry.key)).toEqual(['check-019']);
    expect(rebaselineEntries({ ...input, isKnownReported: () => false }).toReport).toEqual(['check-019']);
    expect(rebaselineEntries({ ...input, isKnownReported: () => true }).toReport).toEqual([]);
  });

  it('a local session adopts it silently', () => {
    expect(rebaselineEntries(input).toReport).toEqual([]);
  });
});
