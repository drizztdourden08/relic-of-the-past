/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { SETTLE_AFTER_MS } from '@rotp/randomizer';
import type { FakeRoom, FakeServer } from '../ap-fake-server';
import { boot, settle } from '../ap-protocol-harness';
import { installNetworkHarness } from './install-network-harness';
import { networkRoom as makeRoom } from './network-room';
import { required } from '../../required';

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const ZELDA_CHECKED = Array.from({ length: 12 }, (_, index) => 1000 + index);
const ZELDA_MISSING = Array.from({ length: 38 }, (_, index) => 2000 + index);
const BOTH_ONLINE = '2 players of 2 connected :: Team #1: Link Zelda';

const trackedRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => makeRoom({
  playersReply: BOTH_ONLINE, tracked: { Zelda: { checked: [...ZELDA_CHECKED], missing: [...ZELDA_MISSING] } }, ...overrides,
});

const zelda = (session: Awaited<ReturnType<typeof boot>>['session']) =>
  required(session.networkStatus.players[1], 'Zelda player status');

const trackerConnects = (server: FakeServer) => server.of('Connect').filter((packet) => packet.tags.includes('Tracker'));

installNetworkHarness();

describe('presence and other players\' checks', () => {
  it('reads every slot\'s client status at connect, then follows its SetReply', async () => {
    const { session, server } = await boot(makeRoom({ clientStatus: { 1: 5, 2: 20 } }));
    const zeldaKey = '_read_client_status_0_2';
    const keys = ['_read_client_status_0_1', zeldaKey];
    expect(server.of('Get')).toEqual([{ cmd: 'Get', keys }]);
    expect(server.of('SetNotify')).toEqual([{ cmd: 'SetNotify', keys }]);
    expect(session.networkStatus.players.map((player) => [player.status, player.online]))
      .toEqual([['connected', true], ['playing', true]]);
    server.push([{ cmd: 'SetReply', key: zeldaKey, value: 30 }]);
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
    const gameConnect = required(server.of('Connect')[0], 'game Connect packet');
    expect(required(connect, 'tracker Connect packet').uuid).toBe(`${gameConnect.uuid}-tracker-2`);
    expect(zelda(session)).toMatchObject({ online: true, checked: 12, total: 50 });
    const firstMissing = required(ZELDA_MISSING[0], 'first missing location');
    server.pushTracker('Zelda', [{ cmd: 'RoomUpdate', checked_locations: [firstMissing] }]);
    await settle();
    expect(zelda(session)).toMatchObject({ checked: 13, total: 50 });
    server.push([
      { cmd: 'PrintJSON', type: 'Join', team: 0, slot: 2, tags: ['Tracker', 'NoText'], data: [{ text: 'Zelda tracking' }] },
      { cmd: 'PrintJSON', type: 'Part', team: 0, slot: 2, data: [{ text: 'Zelda (Team #1) has stopped tracking the game.' }] },
    ]);
    await settle();
    expect(zelda(session).online).toBe(true);
  });
});

describe('presence and other players\' checks', () => {
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
