/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { PING_INTERVAL_MS, PING_TAG } from '@app/lib/game/randomizer-client/network-ping';
import { AP_WORLD_VERSION } from '@shared/randomizer/archipelago/ap-game';
import { stateChip } from '@app/ui/domains/app/views/Randomizer/sub-components/NetworkTab/behavior/network-tone';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { createFakeServer } from '../ap-fake-server';
import type { FakeServer } from '../ap-fake-server';
import { createFakeCore } from '../ap-fake-core';
import { OWN, boot, settle } from '../ap-protocol-harness';
import { installNetworkHarness } from './install-network-harness';
import { networkRoom as makeRoom } from './network-room';

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const pings = (server: FakeServer) => server.of('Bounce').filter((packet) => packet.tags?.includes(PING_TAG));

const echoLastPing = (server: FakeServer): void => {
  const { tags, slots, data } = pings(server).at(-1)!;
  server.push([{ cmd: 'Bounced', tags, slots, data }]);
};

installNetworkHarness();

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
