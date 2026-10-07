/* @layer tests @kind test */
/**
 * Editing an online profile's connection after creation (T30): the profile patch takes only
 * the connection keys and refuses a patch naming anything else, whole; a profile stuck on a
 * wrong room password is fixed by one save, which reconnects the session on the new password
 * against the in-process server and reaches connected with no restart; a `host:port` typed
 * into the host field splits itself, and the port is checked.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile, loadProfile, updateProfile } from '@shared/storage/profiles';
import { applyConnectionPatch } from '@shared/storage/randomizer-connection-patch';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { getSessionState, startOnline, stopActive } from '@app/lib/game/randomizer-client/session-store';
import { onlineConfigOfProfile } from '@app/lib/game/randomizer-client/online-config-of-profile';
import { reconnectProfileSession } from '@app/lib/game/randomizer-client/profile-reconnect';
import {
  joinServerAddress, serverAddressError, splitServerAddress,
} from '@app/lib/game/randomizer-client/server-address';
import { absorbPort, draftError, draftOf, patchOf } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { createMemFileStore } from '../storage/mem-file-store';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import type { FakeServer } from './ap-fake-server';
import type { OnlineSessionConfig } from '@app/lib/game/randomizer-client/online-session-config.type';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';

const fake = vi.hoisted(() => ({ server: null as FakeServer | null }));

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/lib/game/randomizer-client/local-session', () => ({ createLocalSession: () => null }));
vi.mock('@app/lib/game/randomizer-client/online-session', () => ({
  createOnlineSession: (config: OnlineSessionConfig) =>
    createOnlineClient(config, { core: createFakeCore(), createSocket: fake.server!.createSocket }),
}));

const OWN = 'Relic of the Past';
const OPTIONS = { schema: 'ap-options-v2' } as unknown as RandomizerOptionsSnapshot;

const onlineConfig = (password: string): ProfileRandomizerConfig => ({
  mode: 'online', seed: 'seed-1', options: OPTIONS, serverUrl: 'ws://host:38290',
  slotName: 'Link', password, deathLink: false, trackOtherPlayers: false,
});

const createRoom = (): FakeServer => createFakeServer({
  password: 'pw',
  games: { [OWN]: { item_name_to_id: { Bow: 100 }, location_name_to_id: { 'check-001': 1 }, checksum: 'own-1' } },
  items: [], checked: [], missing: [1],
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }],
  slotInfo: { 1: { name: 'Link', game: OWN, type: 1, group_members: [] } },
  slotData: { worldVersion: '0.1.0', options: {}, medallions: { mire: 'Ether', turtleRock: 'Quake' }, deathLink: false },
  placements: {}, refusedUrls: new Set(), seedName: 'seed-A',
});

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
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
  stopActive();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('the connection patch', () => {
  it('changes only the connection keys and clears an emptied password', () => {
    const next = applyConnectionPatch(onlineConfig('nope'), {
      serverUrl: ' other:1 ', slotName: 'Zelda', password: '', deathLink: true, trackOtherPlayers: true,
    });
    expect(next).toEqual({ ...onlineConfig('nope'), serverUrl: 'other:1', slotName: 'Zelda', deathLink: true, trackOtherPlayers: true, password: undefined });
    expect('password' in next).toBe(false);
  });

  it('refuses a patch naming any other key, a local profile, or an empty host', () => {
    const foreign = [{ seed: 'x' }, { options: {} }, { mode: 'local' }, { frozenSettings: {} }, { deliverable: {} }];
    for (const patch of foreign) {
      expect(() => applyConnectionPatch(onlineConfig('pw'), patch as RandomizerConnectionPatch)).toThrow(/cannot change/);
    }
    expect(() => applyConnectionPatch({ ...onlineConfig('pw'), mode: 'local' }, { password: 'x' })).toThrow(/not an online/);
    expect(() => applyConnectionPatch(onlineConfig('pw'), { serverUrl: '  ' })).toThrow(/empty/);
  });

  it('writes nothing when the store refuses the patch', async () => {
    const files = createMemFileStore();
    const { id } = await createProfile(files, { name: 'AP', romFile: 'rom.sfc', randomizer: onlineConfig('nope') });
    const patch = { password: 'pw', seed: 'other' } as RandomizerConnectionPatch;
    await expect(updateProfile(files, id, { randomizerConnection: patch })).rejects.toThrow(/seed cannot change/);
    expect((await loadProfile(files, id))?.randomizer).toEqual(onlineConfig('nope'));
  });
});

describe('fixing a wrong password from the Network tab (T30)', () => {
  it('a save after the refusal reconnects on the new password and becomes active', async () => {
    fake.server = createRoom();
    const files = createMemFileStore();
    const { id, randomizer } = await createProfile(files, { name: 'AP', romFile: 'rom.sfc', randomizer: onlineConfig('nope') });
    await startOnline(onlineConfigOfProfile(randomizer!), 'profile');
    await settle();
    const refused = getSessionState().session!;
    expect([refused.status, refused.kind === 'online' && refused.networkStatus.connection.error])
      .toEqual(['error', 'Wrong room password.']);

    const updated = await updateProfile(files, id, { randomizerConnection: { password: 'pw' } });
    await reconnectProfileSession(id, updated!.randomizer!);
    await settle();

    const { session, source } = getSessionState();
    expect(session).not.toBe(refused);
    expect([session?.status, source]).toEqual(['active', 'profile']);
    expect(session?.kind === 'online' && session.networkStatus.connection.state).toBe('connected');
    expect(fake.server.of('Connect').map((packet) => packet.password)).toEqual(['nope', 'pw']);
    expect((await loadProfile(files, id))?.randomizer?.password).toBe('pw');
  });
});

describe('the address fields', () => {
  it('split a stored address, keep a scheme on the host, and join back', () => {
    expect(splitServerAddress('archipelago.gg:38281')).toEqual({ host: 'archipelago.gg', port: '38281' });
    expect(splitServerAddress('wss://archipelago.gg:38281')).toEqual({ host: 'wss://archipelago.gg', port: '38281' });
    expect(splitServerAddress('localhost')).toEqual({ host: 'localhost', port: '' });
    expect(joinServerAddress({ host: ' localhost ', port: '38290' })).toBe('localhost:38290');
  });

  it('a host:port in the host field moves its port across', () => {
    const draft = { ...draftOf(onlineConfig('pw')), host: 'localhost:38290', port: '1' };
    expect(absorbPort(draft)).toMatchObject({ host: 'localhost', port: '38290' });
    expect(patchOf(absorbPort(draft))).toEqual({
      serverUrl: 'localhost:38290', slotName: 'Link', password: 'pw',
    });
  });

  it('checks the port range, the host and the slot', () => {
    expect(['0', '1', '65535', '65536', 'x', ''].map((port) => serverAddressError({ host: 'h', port }))).toEqual([
      'Port is 1 to 65535.', null, null, 'Port is 1 to 65535.', 'Port is 1 to 65535.', 'Port is 1 to 65535.',
    ]);
    expect(serverAddressError({ host: ' ', port: '1' })).toBe('Enter a host.');
    expect(draftError({ ...draftOf(onlineConfig('pw')), slotName: ' ' })).toBe('Enter a slot name.');
  });
});
