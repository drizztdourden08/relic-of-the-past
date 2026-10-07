/* @layer tests @kind test */
/**
 * The real online core (online-core.ts) against the recording module (ap-fake-module.ts):
 * the online bits of gate word 5 live exactly as long as the session, and a location holding
 * another player's item arms the icon id of that player's game with a line naming the item and
 * who it went to. The sentinel and the icon ids a plan carries are pinned to the core's own
 * definitions. A queued grant reports
 * itself granted only when the core confirms it, and the room's checked locations show done in
 * the tracker and leave the poller for good, with no game flag written.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FOREIGN_ICON_FIRST_ID, FOREIGN_ICON_LAST_ID, FOREIGN_ITEM_ID } from '@app/lib/game/foreign-item-sentinel';
import { FOREIGN_ICON_FILES } from '@shared/asset-extraction/item-sprites/foreign-icons';
import { buildOptionsSnapshot, normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { AP_LOCATION_IDS } from '@shared/randomizer/archipelago/ap-ids.data';
import { stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';
import { installFakeModule } from './ap-fake-module';
import { createFakeServer } from './ap-fake-server';
import { soloRoomOf } from './ap-solo-room';

const lines = vi.hoisted(() => [] as unknown[]);

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/lib/game/session-dialogue', () => ({
  setSessionReceiptMessages: (next: unknown[]) => {
    lines.splice(0, lines.length, ...next);
    return next.map((_, index) => 1000 + index);
  },
  appendSessionReceiptMessage: () => null,
  clearSessionDialogue: () => undefined,
}));
const iconSet = (name: string) => ({ [`apply${name}`]: async () => true, [`clear${name}`]: () => undefined });
vi.mock('@app/lib/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/lib/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/lib/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/lib/game/upgrade-icons', () => iconSet('UpgradeIcons'));
vi.mock('@app/lib/game/foreign-icons', () => iconSet('ForeignIcons'));

const answerEmpty = (): Promise<unknown[]> => Promise.resolve([]);
const preloadApi: unknown = new Proxy({}, { get: () => new Proxy(answerEmpty, { get: () => answerEmpty }) });
(globalThis as { window?: unknown }).window ??= {
  addEventListener: () => undefined, removeEventListener: () => undefined, api: preloadApi,
};
// The modules that call the bridge at load go first (see ap-session-parity.keep.test.ts).
await import('@app/lib/game/cheats');
const { setModule } = await import('@app/lib/game/wasm-bridge');
const { defaultOnlineCore } = await import('@app/lib/game/randomizer-client/online-core');
const { createOnlineClient } = await import('@app/lib/game/randomizer-client/online-client');
const { AP_DEATH_LINK_BIT, AP_ONLINE_BIT, gateWord5Now } = await import('@app/lib/game/gate-word-5');
const {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations,
} = await import('@app/lib/game/randomizer-client/npc-capability');
const { executeEntry } = await import('@app/lib/game/delivery-execute');
const { withCollectedChecks } = await import('@app/lib/game/tracker/collected-checks');
const { rebaselineEntries } = await import('@app/lib/game/randomizer-client/poll-rebaseline');

const settle = async (): Promise<void> => {
  for (let i = 0; i < 400; i += 1) await Promise.resolve();
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

describe('the real online core', () => {
  it('mirrors the core\'s own foreign sentinel', () => {
    const source = readFileSync(resolve(__dirname, '../../core/game-hooks/foreign_item.c'), 'utf8');
    const defined = /^#define FOREIGN_ITEM_ID (0x[0-9A-Fa-f]+)$/m.exec(source);
    expect(Number(defined?.[1])).toBe(FOREIGN_ITEM_ID);
  });

  it('sets the online bits for the session, DeathLink only when asked, and clears both', async () => {
    const core = installFakeModule(setModule);
    try {
      await defaultOnlineCore.arm({ url: 'ws://host:1', slotName: 'Link' });
      expect(gateWord5Now() & (AP_ONLINE_BIT | AP_DEATH_LINK_BIT)).toBe(AP_ONLINE_BIT);
      await defaultOnlineCore.arm({ url: 'ws://host:1', slotName: 'Link', deathLink: true });
      expect(gateWord5Now() & (AP_ONLINE_BIT | AP_DEATH_LINK_BIT)).toBe(AP_ONLINE_BIT | AP_DEATH_LINK_BIT);
      defaultOnlineCore.disarm();
      expect(gateWord5Now() & (AP_ONLINE_BIT | AP_DEATH_LINK_BIT)).toBe(0);
      expect(core.calls.at(-1)).toMatch(/^WasmSetGateWord\(\[5,\d+\]\)$/);
    } finally {
      core.remove();
    }
  });

  it('mirrors the core\'s own foreign icon ids', () => {
    const source = readFileSync(resolve(__dirname, '../../core/game-hooks/foreign_item.c'), 'utf8');
    expect(Number(/^#define FOREIGN_ICON_FIRST (0x[0-9A-Fa-f]+)$/m.exec(source)?.[1])).toBe(FOREIGN_ICON_FIRST_ID);
    expect(Number(/^#define FOREIGN_ICON_LAST (0x[0-9A-Fa-f]+)$/m.exec(source)?.[1])).toBe(FOREIGN_ICON_LAST_ID);
  });

  it('arms another player\'s item as its game\'s icon id, saying what it was and who it went to', async () => {
    const snapshot = normalizeRandomizerOptions(buildOptionsSnapshot({}));
    const placement = generateFromSnapshot('foreign-item', snapshot, probeDeliverableNpcLocations(),
      probeDeliverablePondLocations(), probeDeliverableWorldLocations());
    const room = soloRoomOf(placement, snapshot);
    // The first chest of the escape, handed to a second player.
    const location = AP_LOCATION_IDS['check-012'];
    room.placements[location] = { item: 0x52510000, location, player: 2, flags: 0 };
    room.players.push({ team: 0, slot: 2, alias: 'Zelda_', name: 'Zelda_' });
    room.slotInfo['2'] = { name: 'Zelda_', game: 'Ship of Harkinian', type: 1, group_members: [] };
    room.games['Ship of Harkinian'] = {
      item_name_to_id: { 'Progressive Scale': 0x52510000 }, location_name_to_id: {}, checksum: 'soh',
    };
    const core = installFakeModule(setModule);
    try {
      const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' },
        { core: defaultOnlineCore, createSocket: createFakeServer(room).createSocket });
      await session.start();
      await settle();
      expect(session.status).toBe('active');
      expect(session.placement?.locations['check-012']).toBe('item-foreign');
      const plain = (line: unknown): string[] => (Array.isArray(line) ? (line as string[]).map(stripHighlight) : []);
      const lineIndex = lines.findIndex((line) => plain(line)[0] === 'Progressive Scale sent to Zelda_!');
      expect(lineIndex).toBeGreaterThanOrEqual(0);
      expect(plain(lines[lineIndex]).at(-1)).toBe('Sent to Zelda_!');
      // Ship of Harkinian plays Ocarina of Time: the ocarina's picture, id 0xB0 + its place.
      const ocarinaId = FOREIGN_ICON_FIRST_ID + FOREIGN_ICON_FILES.indexOf('pool-ocarina-of-time');
      const foreignArms = core.calls.filter((call) => call.includes(`,${ocarinaId},${1000 + lineIndex}`));
      expect(foreignArms).toHaveLength(1);
      session.stop();
      await settle();
    } finally {
      core.remove();
    }
  });

  it('reports a queued grant granted only when the core confirms it', () => {
    const core = installFakeModule(setModule);
    try {
      let granted = 0;
      const entry = {
        id: 'dlv', message: 'Hookshot', source: 'randomizer', enqueuedAt: 0, onGranted: () => { granted += 1; },
        action: { type: 'give_item' as const, itemId: 0x0a, receiptExport: true },
      };
      core.setReturn('WasmGrantItemWithReceipt', 0);
      expect([executeEntry(entry), granted]).toEqual(['refused', 0]);
      core.setReturn('WasmGrantItemWithReceipt', 1);
      expect([executeEntry(entry), granted]).toEqual(['done', 1]);
    } finally {
      core.remove();
    }
  });

  it('shows the room\'s checked locations done and takes them out of the poller, writing no flag', () => {
    const core = installFakeModule(setModule);
    try {
      // A shelf's first stock ticks the shelf's record; its restock has none to tick.
      defaultOnlineCore.markCollected([
        'check-012', 'kakariko-shop-shelf_left-slot_1', 'kakariko-shop-shelf_left-slot_2',
      ]);
      expect([...withCollectedChecks(new Set())]).toEqual(['check-012', 'check-638']);
      expect(core.calls.filter((call) => !call.startsWith('WasmSetGateWord'))).toEqual([]);
      defaultOnlineCore.disarm();
      expect([...withCollectedChecks(new Set())]).toEqual([]);
      // The poller's baseline never reports a suppressed key, whatever the save shows.
      expect(rebaselineEntries({
        entries: [{ key: 'check-012' }], suppressed: new Set(['check-012']), isComplete: () => true, isKnownReported: () => false,
      }).toReport).toEqual([]);
    } finally {
      core.remove();
    }
  });
});
