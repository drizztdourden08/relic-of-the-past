/* @layer tests @kind test */
/**
 * The multiworld client against an in-process server (ap-fake-server.ts) and a recording
 * core (ap-fake-core.ts), in node: the handshake, slot data, the received index across a
 * reconnect, the gap Sync, the own-pickup echo, server items, offline checks, the goal, the
 * reconnect backoff, rendered messages and the server address candidates. DeathLink and the
 * world package version are in ap-deathlink.keep.test.ts; the shared room and boot are in
 * ap-protocol-harness.ts.
 */
import { describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { serverUrlCandidates } from '@app/lib/game/randomizer-client/server-url';
import { createFakeServer, VERSION } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import { boot, installClientHarness, item, makeRoom, OWN, settle } from './ap-protocol-harness';

// The real bus installs window error handlers on import; node has no window.
vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

installClientHarness();

describe('handshake', () => {
  it('connects a local server over plain ws only, with password, uuid, the server version and DeathLink', async () => {
    const room = makeRoom({ password: 'pw' });
    const { server, session } = await boot(room, { deathLink: true });
    expect(server.urls).toEqual(['ws://localhost:38281']);
    expect(server.of('GetDataPackage')[0].games.sort()).toEqual(['Other', OWN].sort());
    const [connect] = server.of('Connect');
    expect(connect).toMatchObject({
      game: OWN, name: 'Link', password: 'pw', version: VERSION, items_handling: 0b111, tags: ['DeathLink'], slot_data: true,
    });
    expect(connect.uuid).toBe(localStorage.getItem('rotp.ap.uuid'));
    expect(session.status).toBe('active');
  });

  it('tries an online server over wss first and falls back to ws when that never opens', async () => {
    const secure = await boot(makeRoom(), { url: 'archipelago.gg:38281' });
    expect(secure.server.urls).toEqual(['wss://archipelago.gg:38281']);
    expect(secure.session.status).toBe('active');
    const plain = await boot(makeRoom({ refusedUrls: new Set(['wss://play.example.org:38281']) }), { url: 'play.example.org:38281' });
    expect(plain.server.urls).toEqual(['wss://play.example.org:38281', 'ws://play.example.org:38281']);
    expect(plain.session.status).toBe('active');
  });

  it('stores slot data and the room, and reuses the cached data package', async () => {
    const { session } = await boot(makeRoom());
    expect(session.slotData).toEqual({
      worldVersion: '0.1.0', options: { goal: 'ganon' }, medallions: { mire: 'Ether', turtleRock: 'Quake' },
      preRolled: { shopPrices: [10] }, deathLink: false,
    });
    expect([session.team, session.slot, session.players.length]).toEqual([0, 1, 2]);
    expect([...session.missingLocations]).toEqual([1, 2, 3]);
    const again = await boot(makeRoom());
    expect(again.server.of('GetDataPackage')).toHaveLength(0);
    expect(again.server.of('Connect')).toHaveLength(1);
  });

  it('a wrong password ends in error with nothing left armed', async () => {
    const { session, core } = await boot(makeRoom({ password: 'pw' }), { password: 'nope' });
    expect(session.status).toBe('error');
    expect(core.disarms).toBeGreaterThan(0);
  });
});

describe('received items', () => {
  it('never delivers an item twice across a reconnect that replays the whole list', async () => {
    const room = makeRoom({ items: [item(100, 2, 900), item(101, 2, 900)] });
    const { server, core, session } = await boot(room);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot']);
    expect(core.index).toBe(2);
    server.drop();
    await settle();
    expect(session.status).toBe('reconnecting');
    room.items.push(item(102, 2, 900));
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(session.status).toBe('active');
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot', 'Lamp']);
    expect(core.index).toBe(3);
  });

  it('a gap asks for Sync and resumes from the saved index', async () => {
    const room = makeRoom({ items: [item(100, 2, 900), item(101, 2, 900)] });
    const { server, core } = await boot(room);
    room.items.push(item(102, 2, 900), item(103, 2, 900));
    server.push([{ cmd: 'ReceivedItems', index: 3, items: [item(103, 2, 900)] }]);
    await settle();
    expect(server.of('Sync')).toHaveLength(1);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot', 'Lamp', 'Boots']);
    expect(core.index).toBe(4);
  });

  it('skips an own pickup echo only when the sender is this slot, and delivers server items', async () => {
    const room = makeRoom({ items: [item(100, 1, 1), item(103, 2, 1), item(102, 0, -1)] });
    const server = createFakeServer(room);
    const core = createFakeCore();
    core.armedLocations.add(1);
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    expect(core.delivered).toEqual([{ itemName: 'Boots', sender: 'Zelda' }, { itemName: 'Lamp', sender: null }]);
    expect(core.index).toBe(3);
    expect(session.senderNameOf(item(102, 0, -1))).toBe('Server');
  });
});

describe('checks and goal', () => {
  it('reports offline checks the server lacks, and the goal once', async () => {
    const room = makeRoom({ checked: [2], missing: [1, 3] });
    const server = createFakeServer(room);
    const core = createFakeCore();
    core.localComplete = new Set(['check-001', 'check-002', 'check-351']);
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    expect(server.of('LocationChecks').flatMap((p) => p.locations)).toEqual([1]);
    core.reporter?.reportCheck('check-351');
    expect(server.of('StatusUpdate')).toEqual([{ cmd: 'StatusUpdate', status: 30 }]);
  });
});

describe('reconnect', () => {
  it('backs off 1s, 2s, 4s while the server stays away', async () => {
    const room = makeRoom();
    const { server, session } = await boot(room, { url: 'ws://host:1' });
    room.refusedUrls.add('ws://host:1');
    server.drop();
    await settle();
    const dials = (): number => server.urls.length;
    const before = dials();
    await vi.advanceTimersByTimeAsync(999);
    expect(dials()).toBe(before);
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(dials()).toBe(before + 1);
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(dials()).toBe(before + 2);
    await vi.advanceTimersByTimeAsync(3999);
    expect(dials()).toBe(before + 2);
    room.refusedUrls.clear();
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(session.status).toBe('active');
  });
});

describe('messages', () => {
  it('renders PrintJSON with names from every game in the room', async () => {
    const { server, session } = await boot(makeRoom());
    const seen: string[] = [];
    session.onMessages((messages) => seen.push(messages[messages.length - 1].text));
    server.push([{
      cmd: 'PrintJSON', type: 'ItemSend',
      data: [
        { type: 'player_id', text: '2' }, { text: ' sent ' }, { type: 'item_id', text: '100', player: 1 },
        { text: ' to ' }, { type: 'player_id', text: '1' }, { text: ' (' },
        { type: 'location_id', text: '900', player: 2 }, { text: ')' },
      ],
    }]);
    await settle();
    expect(seen).toEqual(['Zelda sent Bow to Link (Other Place)']);
    expect(session.messages[0]).toMatchObject({ kind: 'item', text: 'Zelda sent Bow to Link (Other Place)' });
  });
});

describe('server url candidates', () => {
  const LOCAL = [
    'localhost:38281', 'LOCALHOST:38281', 'room.localhost:38281', '127.0.0.1:38281', '127.5.5.5',
    '0.0.0.0:38281', '10.0.0.4:38281', '172.16.0.9:38281', '172.31.255.1:38281', '192.168.1.20:38281',
    '169.254.3.3:38281', '[::1]:38281', '::1', '[fd12:3456::1]:38281', '[fe80::1]:38281',
    'gaming-pc:38281', 'nas.local:38281',
  ];
  const ONLINE = [
    'archipelago.gg:38281', '8.8.8.8:38281', '172.32.0.1:38281', '172.15.0.1:38281', '192.169.0.1:38281',
    '[2001:db8::1]:38281', 'my.server.net',
  ];

  it.each(LOCAL)('connects to local %s over plain ws only', (address) => {
    expect(serverUrlCandidates(address)).toEqual([`ws://${address}`]);
  });

  it.each(ONLINE)('tries online %s over wss first, then ws', (address) => {
    expect(serverUrlCandidates(address)).toEqual([`wss://${address}`, `ws://${address}`]);
  });

  it('keeps a scheme the address names, local or not', () => {
    expect(serverUrlCandidates('wss://localhost:38281')).toEqual(['wss://localhost:38281']);
    expect(serverUrlCandidates(' ws://archipelago.gg:38281 ')).toEqual(['ws://archipelago.gg:38281']);
  });
});
