/* @layer tests @kind test */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile, loadProfile, updateProfile } from '@app/profiles/storage';
import { applyConnectionPatch } from '@app/profiles/connection-patch/randomizer-connection-patch';
import { joinServerAddress, serverAddressError, splitServerAddress } from '@drizztdourden08/brock-randomizer/archipelago';
import { required } from '@rotp/asset-extraction/testing';
import { createMemFileStore } from '../storage/mem-file-store';
import { installFakeModule } from './ap-fake-module';
import { createFakeServer } from './ap-fake-server';
import type { FakeServer } from './ap-fake-server';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@app/profiles/types';

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/game/event-log/append-event', () => ({ appendEvent: (): void => undefined }));
vi.mock('@app/game/session-dialogue', () => ({
  setSessionReceiptMessages: (lines: unknown[]) => lines.map((_, index) => 1000 + index),
  appendSessionReceiptMessage: () => null,
  clearSessionDialogue: () => undefined,
}));
const iconSet = (name: string) => ({ [`apply${name}`]: () => Promise.resolve(true), [`clear${name}`]: () => undefined });
vi.mock('@app/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/game/upgrade-icons', () => iconSet('UpgradeIcons'));
vi.mock('@app/game/foreign-icons', () => ({ applyForeignIcons: () => Promise.resolve(false), clearForeignIcons: () => undefined }));

const answerEmpty = (): Promise<unknown[]> => Promise.resolve([]);
const preloadApi: unknown = new Proxy({}, { get: () => new Proxy(answerEmpty, { get: () => answerEmpty }) });
(globalThis as { window?: unknown }).window ??= {
  addEventListener: () => undefined, removeEventListener: () => undefined, api: preloadApi,
};
const { setModule } = await import('@rotp/game-core');
const { createOnlineSessionFactory, registerSessionFactory, startSession } =
  await import('@drizztdourden08/brock-randomizer/session');
const { rotpRandomizer } = await import('@app/randomizer/rotp-randomizer');
const { stopActive, getSessionState } = await import('@app/game/randomizer-client/session-store');
const { reconnectProfileSession } = await import('@app/game/randomizer-client/profile-reconnect');

const fake = { server: undefined as FakeServer | undefined };
const OWN = 'Relic of the Past';
const OPTIONS: RandomizerOptionsSnapshot = { schema: 'ap-options-v2', values: {} };

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

describe('the connection patch', { tags: ['critical'] }, () => {
  it('changes only the connection keys and clears an emptied password', () => {
    const next = applyConnectionPatch(onlineConfig('nope'), {
      serverUrl: ' other:1 ', slotName: 'Zelda', password: '', deathLink: true, trackOtherPlayers: true,
    });
    const before = onlineConfig('nope');
    expect(next).toEqual({
      ...before, serverUrl: 'other:1', slotName: 'Zelda', deathLink: true, trackOtherPlayers: true, password: undefined,
      options: { ...before.options, values: { ...before.options.values, death_link: true } },
    });
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

describe('fixing a wrong password from the Network tab (T30)', { tags: ['critical'] }, () => {
  it('a save after the refusal reconnects on the new password and becomes active', async () => {
    fake.server = createRoom();
    const core = installFakeModule(setModule);
    const archipelago = Object.create(rotpRandomizer.archipelago, {
      createSocket: { value: required(fake.server, 'fake server').createSocket },
    });
    registerSessionFactory(createOnlineSessionFactory({ ...rotpRandomizer, archipelago }, () => undefined));
    const files = createMemFileStore();
    const { id, randomizer } = await createProfile(files, { name: 'AP', romFile: 'rom.sfc', randomizer: onlineConfig('nope') });
    await startSession({ profileId: id, mode: 'online', config: required(randomizer, 'stored randomizer config') } as never);
    await settle();
    const refused = required(getSessionState().session ?? undefined, 'refused session');
    expect(refused.status).toBe('error');
    expect(refused.kind === 'online' && refused.client.status().connection).toBe('refused');

    const updated = await updateProfile(files, id, { randomizerConnection: { password: 'pw' } });
    const updatedProfile = required(updated ?? undefined, 'updated profile');
    await reconnectProfileSession(id, required(updatedProfile.randomizer, 'updated randomizer config'));
    await settle();

    const { session, source } = getSessionState();
    expect(session).toBe(refused);
    expect([session?.status, source]).toEqual(['active', 'profile']);
    expect(session?.kind === 'online' && session.client.status().connection).toBe('connected');
    expect(fake.server.of('Connect').map((packet) => packet.password)).toEqual(['nope', 'pw']);
    expect((await loadProfile(files, id))?.randomizer?.password).toBe('pw');
    core.remove();
  });
});

describe('the address fields', { tags: ['critical'] }, () => {
  it('split a stored address, keep a scheme on the host, and join back', () => {
    expect(splitServerAddress('archipelago.gg:38281')).toEqual({ host: 'archipelago.gg', port: '38281' });
    expect(splitServerAddress('wss://archipelago.gg:38281')).toEqual({ host: 'wss://archipelago.gg', port: '38281' });
    expect(splitServerAddress('localhost')).toEqual({ host: 'localhost', port: '' });
    expect(joinServerAddress({ host: ' localhost ', port: '38290' })).toBe('localhost:38290');
  });

  it('checks the port range, the host and the slot', () => {
    expect(['0', '1', '65535', '65536', 'x', ''].map((port) => serverAddressError({ host: 'h', port }))).toEqual([
      'Port is 1 to 65535.', null, null, 'Port is 1 to 65535.', 'Port is 1 to 65535.', 'Port is 1 to 65535.',
    ]);
    expect(serverAddressError({ host: ' ', port: '1' })).toBe('Enter a host.');
  });
});
