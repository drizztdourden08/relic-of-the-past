/* @layer tests @kind test */
/**
 * The online session's network section (network-status.ts and network-monitor.ts) against the
 * in-process server: a connect fills the connection, server and progress facts; a ping's echo
 * gives the round trip and its mean; Join and Part mark the other players online or not; a
 * RoomUpdate's hint points land; a drop reads as reconnecting with its countdown, a try in
 * flight as trying now with none, and a refusal as an error with its reason. At connect the client status of every slot is read and
 * watched, and `!players` decides who is online; then one tracker link per other player
 * reports their checks, closes with the session, and never opens with the option off.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { PING_INTERVAL_MS, PING_TAG } from '@app/lib/game/randomizer-client/network-ping';
import { SETTLE_AFTER_MS } from '@app/lib/game/randomizer-client/network-roster';
import { AP_WORLD_VERSION } from '@shared/randomizer/archipelago/ap-game';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import { stateChip } from '@app/ui/domains/app/views/Randomizer/sub-components/NetworkTab/behavior/network-tone';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { FakeRoom, FakeServer } from './ap-fake-server';
import type { OnlineSessionConfig } from '@app/lib/game/randomizer-client/online-session-config.type';

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OWN = 'Relic of the Past';

const makeRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => ({
  games: {
    [OWN]: { item_name_to_id: { Bow: 100, Hookshot: 101 }, location_name_to_id: { 'check-001': 1, 'check-002': 2 }, checksum: 'own-1' },
    Other: { item_name_to_id: { 'Other Sword': 500 }, location_name_to_id: { 'Other Place': 900 }, checksum: 'other-1' },
  },
  items: [{ item: 100, location: 900, player: 2, flags: 0 }],
  checked: [],
  missing: [1, 2],
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }, { team: 0, slot: 2, alias: 'Zelda', name: 'Zelda' }],
  slotInfo: {
    1: { name: 'Link', game: OWN, type: 1, group_members: [] },
    2: { name: 'Zelda', game: 'Other', type: 1, group_members: [] },
  },
  slotData: { worldVersion: '0.1.0', options: {}, medallions: { mire: 'Ether', turtleRock: 'Quake' }, deathLink: false },
  placements: { 1: { item: 101, location: 1, player: 1, flags: 0 }, 2: { item: 500, location: 2, player: 2, flags: 0 } },
  refusedUrls: new Set(),
  seedName: 'SEED42',
  ...overrides,
});

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
};

const boot = async (room: FakeRoom, extra: Partial<OnlineSessionConfig> = {}) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  const session = createOnlineClient(
    { url: 'localhost:38281', slotName: 'Link', password: room.password, ...extra },
    { core, createSocket: server.createSocket },
  );
  await session.start();
  await settle();
  return { server, core, session };
};

const pings = (server: FakeServer) => server.of('Bounce').filter((packet) => packet.tags?.includes(PING_TAG));

/** The server's echo of the last ping, as it forwards a Bounce to the slots it names. */
const echoLastPing = (server: FakeServer): void => {
  const { tags, slots, data } = pings(server).at(-1)!;
  server.push([{ cmd: 'Bounced', tags, slots, data }]);
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
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

describe('network status', () => {
  it('a connect fills the connection, server and progress facts', async () => {
    const { session, server } = await boot(makeRoom({ password: 'pw' }));
    const { connection, health, server: info, progress } = session.networkStatus;
    expect(connection).toMatchObject({
      state: 'connected', configuredUrl: 'localhost:38281', url: 'ws://localhost:38281', seedName: 'SEED42',
      serverVersion: '0.6.3', slot: 1, slotName: 'Link', team: 0, worldVersion: '0.1.0',
      appWorldVersion: AP_WORLD_VERSION, deathLink: false, passwordUsed: true, connectedAt: 1_000_000, error: null,
    });
    expect(connection.uuidShort).toBe(server.of('Connect')[0].uuid.split('-')[0]);
    expect(health.packetsIn).toBeGreaterThanOrEqual(4);
    expect(health.packetsOut).toBe(server.received.length);
    expect(health.lastPacketAt).toBe(1_000_000);
    expect([health.receivedIndex, health.queuedItems, health.heldItems, health.fileInPlay]).toEqual([1, 0, 0, true]);
    expect(info.games).toEqual([OWN, 'Other']);
    expect(info.checksums).toEqual([{ game: OWN, matched: true }, { game: 'Other', matched: true }]);
    expect(info.passwordRequired).toBe(true);
    expect(progress).toEqual({ checked: 0, total: 2, itemsReceived: 1, itemsSentToOthers: 0, goalReported: false });
  });

  it('counts a reported check holding another player\'s item as sent to them', async () => {
    const { session } = await boot(makeRoom());
    session.reportCheck('check-001' as LocationKey);
    session.reportCheck('check-002' as LocationKey);
    expect(session.networkStatus.progress.itemsSentToOthers).toBe(1);
  });

  it('a ping echo gives the round trip, and the mean follows the samples', async () => {
    const { session, server } = await boot(makeRoom());
    expect(pings(server)).toHaveLength(1);
    expect(pings(server)[0]).toMatchObject({ slots: [1], data: { t: 1_000_000, id: 0 } });
    await vi.advanceTimersByTimeAsync(40);
    echoLastPing(server);
    await settle();
    expect(session.networkStatus.health).toMatchObject({ pingMs: 40, pingMeanMs: 40, pingSamples: 1 });
    await vi.advanceTimersByTimeAsync(PING_INTERVAL_MS - 40);
    expect(pings(server)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(20);
    echoLastPing(server);
    await settle();
    expect(session.networkStatus.health).toMatchObject({ pingMs: 20, pingMeanMs: 30, pingSamples: 2 });
  });

  it('Join and Part mark the other players online or not; ours follows the connection', async () => {
    const { session, server } = await boot(makeRoom());
    const onlineOf = () => session.networkStatus.players.map((player) => [player.alias, player.online, player.self]);
    expect(onlineOf()).toEqual([['Link', true, true], ['Zelda', null, false]]);
    expect(session.networkStatus.players[1]).toMatchObject({ game: 'Other', checked: null, total: null });
    server.push([{ cmd: 'PrintJSON', type: 'Join', team: 0, slot: 2, data: [{ text: 'Zelda joined' }] }]);
    await settle();
    expect(onlineOf()[1]).toEqual(['Zelda', true, false]);
    server.push([{ cmd: 'PrintJSON', type: 'Part', team: 0, slot: 2, data: [{ text: 'Zelda left' }] }]);
    await settle();
    expect(onlineOf()[1]).toEqual(['Zelda', false, false]);
  });

  it('a RoomUpdate\'s hint points land, and listeners hear it', async () => {
    const { session, server } = await boot(makeRoom());
    const heard: (number | null)[] = [];
    const off = session.onNetworkStatus((status) => heard.push(status.server.hintPoints));
    server.push([{ cmd: 'RoomUpdate', hint_points: 7 }]);
    await settle();
    off();
    expect(session.networkStatus.server.hintPoints).toBe(7);
    expect(heard.at(-1)).toBe(7);
  });

  it('a drop reads as reconnecting with the attempt and the next try; a refusal as an error', async () => {
    const { session, server } = await boot(makeRoom());
    server.drop();
    await settle();
    expect(session.networkStatus.connection).toMatchObject({
      state: 'reconnecting', reconnectAttempt: 1, nextRetryAt: Date.now() + 1000, connectedAt: null,
    });
    expect(session.networkStatus.connection.retryInFlight).toBe(false);
    const refused = await boot(makeRoom({ password: 'pw' }), { password: 'nope' });
    expect(refused.session.networkStatus.connection).toMatchObject({
      state: 'error', error: 'Wrong room password.',
    });
  });

  it('a try in flight reads as trying now, with no countdown; a refused one schedules the next', async () => {
    const room = makeRoom();
    const server = createFakeServer(room);
    const atEachTry: unknown[] = [];
    let session: ReturnType<typeof createOnlineClient> | null = null;
    session = createOnlineClient({ url: 'localhost:38281', slotName: 'Link' }, {
      core: createFakeCore(),
      createSocket: (url) => {
        const { connection } = session!.networkStatus;
        const { state, reconnectAttempt, nextRetryAt, retryInFlight } = connection;
        atEachTry.push({ state, reconnectAttempt, nextRetryAt, retryInFlight, chip: stateChip(connection, Date.now()).label });
        return server.createSocket(url);
      },
    });
    await session.start();
    await settle();
    server.drop();
    await settle();
    room.refusedUrls.add('ws://localhost:38281');
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(atEachTry.at(-1)).toEqual({
      state: 'reconnecting', reconnectAttempt: 1, nextRetryAt: null, retryInFlight: true, chip: 'reconnecting, trying now',
    });
    expect(session.networkStatus.connection).toMatchObject({
      state: 'reconnecting', reconnectAttempt: 2, nextRetryAt: Date.now() + 2000, retryInFlight: false,
    });
    expect(stateChip(session.networkStatus.connection, Date.now()).label).toBe('reconnecting, try 2 in 2 s');
    room.refusedUrls.delete('ws://localhost:38281');
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(atEachTry.at(-1)).toMatchObject({ reconnectAttempt: 2, retryInFlight: true });
    expect(session.networkStatus.connection).toMatchObject({ state: 'connected', retryInFlight: false, nextRetryAt: null });
  });
});

const ZELDA_CHECKED = Array.from({ length: 12 }, (_, index) => 1000 + index);
const ZELDA_MISSING = Array.from({ length: 38 }, (_, index) => 2000 + index);
const BOTH_ONLINE = '2 players of 2 connected :: Team #1: Link Zelda';

const trackedRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => makeRoom({
  playersReply: BOTH_ONLINE, tracked: { Zelda: { checked: [...ZELDA_CHECKED], missing: [...ZELDA_MISSING] } }, ...overrides,
});

const zelda = (session: Awaited<ReturnType<typeof boot>>['session']) => session.networkStatus.players[1];

const trackerConnects = (server: FakeServer) => server.of('Connect').filter((packet) => packet.tags.includes('Tracker'));

describe('presence and other players\' checks', () => {
  it('reads every slot\'s client status at connect, then follows its SetReply', async () => {
    const { session, server } = await boot(makeRoom({ clientStatus: { 1: 5, 2: 20 } }));
    const keys = ['_read_client_status_0_1', '_read_client_status_0_2'];
    expect(server.of('Get')).toEqual([{ cmd: 'Get', keys }]);
    expect(server.of('SetNotify')).toEqual([{ cmd: 'SetNotify', keys }]);
    expect(session.networkStatus.players.map((player) => [player.status, player.online]))
      .toEqual([['connected', true], ['playing', true]]);
    server.push([{ cmd: 'SetReply', key: keys[1], value: 30 }]);
    await settle();
    expect(zelda(session).status).toBe('goal');
  });

  it('`!players` decides who is online, and neither it nor its echo reaches the log twice', async () => {
    const reply = '1 players of 2 connected :: Team #1: Link (Zelda)';
    const { session, server } = await boot(makeRoom({ clientStatus: { 1: 5, 2: 5 }, playersReply: reply }));
    expect(server.of('Say')).toEqual([{ cmd: 'Say', text: '!players' }]);
    expect(zelda(session)).toMatchObject({ online: false, status: 'unknown' });
    const texts = session.messages.map((message) => message.text);
    expect(texts.filter((text) => text === reply)).toHaveLength(1);
    expect(texts.some((text) => text.endsWith(': !players'))).toBe(false);
    server.push([{ cmd: 'PrintJSON', type: 'Join', team: 0, slot: 2, tags: [], data: [{ text: 'Zelda joined' }] }]);
    await settle();
    expect(zelda(session).online).toBe(true);
  });

  it('a tracker link reports 12 / 50, then 13 / 50 after a RoomUpdate; its own join never counts', async () => {
    const { session, server } = await boot(trackedRoom());
    await settle();
    expect(server.trackers()).toEqual(['Zelda']);
    const [connect] = trackerConnects(server);
    expect(connect).toMatchObject({ game: '', name: 'Zelda', items_handling: 0, slot_data: false, tags: ['Tracker', 'NoText'] });
    expect(connect.uuid).toBe(`${server.of('Connect')[0].uuid}-tracker-2`);
    expect(zelda(session)).toMatchObject({ online: true, checked: 12, total: 50 });
    server.pushTracker('Zelda', [{ cmd: 'RoomUpdate', checked_locations: [ZELDA_MISSING[0]] }]);
    await settle();
    expect(zelda(session)).toMatchObject({ checked: 13, total: 50 });
    server.push([
      { cmd: 'PrintJSON', type: 'Join', team: 0, slot: 2, tags: ['Tracker', 'NoText'], data: [{ text: 'Zelda tracking' }] },
      { cmd: 'PrintJSON', type: 'Part', team: 0, slot: 2, data: [{ text: 'Zelda (Team #1) has stopped tracking the game.' }] },
    ]);
    await settle();
    expect(zelda(session).online).toBe(true);
  });

  it('tracker links close with the connection, reopen after a reconnect, and close on stop', async () => {
    const { session, server } = await boot(trackedRoom());
    await settle();
    expect(server.trackers()).toEqual(['Zelda']);
    server.drop();
    await settle();
    expect(server.trackers()).toEqual([]);
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    await settle();
    expect(server.trackers()).toEqual(['Zelda']);
    session.stop();
    await settle();
    expect(server.trackers()).toEqual([]);
    expect(session.status).toBe('idle');
  });

  it('with no `!players` answer the links wait for the settle time; the option off opens none', async () => {
    const quiet = await boot(trackedRoom({ playersReply: undefined }));
    expect(quiet.server.trackers()).toEqual([]);
    await vi.advanceTimersByTimeAsync(SETTLE_AFTER_MS);
    await settle();
    expect(quiet.server.trackers()).toEqual(['Zelda']);
    const off = await boot(trackedRoom(), { trackOtherPlayers: false });
    await vi.advanceTimersByTimeAsync(SETTLE_AFTER_MS);
    await settle();
    expect(trackerConnects(off.server)).toEqual([]);
    expect(zelda(off.session)).toMatchObject({ online: true, checked: null, total: null });
  });
});
