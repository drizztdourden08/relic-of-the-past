/* @layer tests @kind test */
/**
 * DeathLink's toasts, read at the online notice seam (online-notices.ts) that the play area's
 * toast stack listens to, with the online client against an in-process server and a recording
 * core: a room death that kills Link, one that finds him already down, and our own death sent
 * out, each with the exact line the toast shows. No death the room caused, and no bounce of our
 * own, raises one.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { onOnlineNotice } from '@app/lib/game/randomizer-client/online-notices';
import {
  deathLinkToastLine, deathLinkToastText, MAX_CAUSE_LENGTH,
} from '@app/lib/game/randomizer-client/death-link-toast-text';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import type { FakeRoom } from './ap-fake-server';
import type { DeathLinkNotice, OnlineNotice } from '@app/lib/game/randomizer-client/online-notices';

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OWN = 'Relic of the Past';
const CAUSE = 'Shipwrecked by King Harkinian';

const room = (): FakeRoom => ({
  games: {
    [OWN]: { item_name_to_id: { Bow: 100 }, location_name_to_id: { 'check-001': 1 }, checksum: 'own-1' },
    Other: { item_name_to_id: { 'Other Sword': 500 }, location_name_to_id: { 'Other Place': 900 }, checksum: 'other-1' },
  },
  items: [],
  checked: [],
  missing: [1],
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }, { team: 0, slot: 2, alias: 'Drizztdourden_', name: 'Drizztdourden_' }],
  slotInfo: {
    1: { name: 'Link', game: OWN, type: 1, group_members: [] },
    2: { name: 'Drizztdourden_', game: 'Other', type: 1, group_members: [] },
  },
  slotData: {
    worldVersion: '0.1.0', options: { goal: 'ganon' }, medallions: { mire: 'Ether', turtleRock: 'Quake' },
    preRolled: { shopPrices: [10] }, deathLink: true,
  },
  placements: { 1: { item: 100, location: 1, player: 1, flags: 0 } },
  refusedUrls: new Set(),
});

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
};

const boot = async () => {
  const server = createFakeServer(room());
  const core = createFakeCore();
  const lines: string[] = [];
  const notices: OnlineNotice[] = [];
  const unsubscribe = onOnlineNotice((notice) => {
    if (notice.kind !== 'deathLink') return;
    notices.push(notice);
    lines.push(notice.text);
  });
  const session = createOnlineClient(
    { url: 'localhost:38281', slotName: 'Link', deathLink: true },
    { core, createSocket: server.createSocket },
  );
  await session.start();
  await settle();
  const bounce = async (source: string, cause: string): Promise<void> => {
    server.push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source, time: 0, cause } }]);
    await settle();
  };
  return { server, core, lines, notices, bounce, stop: () => { unsubscribe(); session.stop(); } };
};

beforeEach(() => {
  vi.useFakeTimers();
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('DeathLink toasts from the session', () => {
  it('a room death that kills Link shows who died and why', async () => {
    const { core, lines, notices, bounce, stop } = await boot();
    await bounce('Drizztdourden_', CAUSE);
    expect(core.kills).toBe(1);
    expect(notices.map((notice) => notice.parts)).toEqual([
      [{ text: 'Drizztdourden_', tone: 'player' }, { text: ` died: ${CAUSE}` }],
    ]);
    expect(lines).toEqual(['Drizztdourden_ died: Shipwrecked by King Harkinian']);
    stop();
  });

  it('a room death while Link is already down says so, and kills nothing', async () => {
    const { core, lines, bounce, stop } = await boot();
    core.down = true;
    await bounce('Drizztdourden_', CAUSE);
    expect(core.kills).toBe(0);
    expect(lines).toEqual(['Drizztdourden_ died: Shipwrecked by King Harkinian (already down)']);
    stop();
  });

  it('our own death sent out shows once; the room-caused one and our echo show nothing', async () => {
    const { lines, core, bounce, stop } = await boot();
    core.die(0);
    await settle();
    expect(lines).toEqual(['Your death was sent to the room.']);
    await bounce('Link', 'Link died');
    await vi.advanceTimersByTimeAsync(6000);
    await bounce('Drizztdourden_', CAUSE);
    core.die(1);
    await settle();
    expect(lines).toEqual(['Your death was sent to the room.', 'Drizztdourden_ died: Shipwrecked by King Harkinian']);
    stop();
  });
});

describe('the toast line', () => {
  const received = (cause: string): DeathLinkNotice => ({ kind: 'received', source: 'Zelda', cause });

  it('a cause that adds nothing reads as a plain line', () => {
    expect(['', '  ', 'Zelda', 'Zelda died', 'zelda died.'].map((cause) => deathLinkToastLine(received(cause))))
      .toEqual(Array(5).fill('Zelda died, and took you along.'));
    expect(deathLinkToastLine({ kind: 'dropped', source: 'Zelda', cause: '' })).toBe('Zelda died (already down)');
  });

  it('a cause that opens with the name is kept as its own sentence, the name drawn apart', () => {
    expect(deathLinkToastText(received('Zelda fell into a pit'))).toEqual({ name: 'Zelda', text: ' fell into a pit' });
  });

  it('the cause is shown on one line and cut to fit', () => {
    const line = deathLinkToastText(received(`was\n  ${'x'.repeat(200)}`)).text;
    expect(line.startsWith(' died: was x')).toBe(true);
    expect(line.endsWith('...')).toBe(true);
    expect(line.length).toBe(' died: '.length + MAX_CAUSE_LENGTH);
  });
});
