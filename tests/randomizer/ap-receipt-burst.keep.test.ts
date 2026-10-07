/* @layer tests @kind test */
/**
 * A burst of received items (a goal's collect sends every remaining item in one packet). Each
 * item's line is composed when its delivery reaches the front of the queue, so 200 items queued
 * at once each show their own line and none falls back to the class line, while the ring of 32
 * never holds more than the delivery in flight. Runs the real composer against the recording
 * core (ap-fake-module.ts); the queue is a recording stand-in driven in order, as the real one runs.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { packPackedBytes, unpackPackedBytes } from '@shared/asset-extraction/packed-bytes';
import { RANDOMIZER_MSG_BASE, RANDOMIZER_RECEIPT_MSG } from '@shared/asset-extraction/text/data/randomizer-templates';
import { progressiveCapacityItemName } from '@shared/game/data/capacity-progressive-item';
import { renderCapacityStep } from '@shared/randomizer/receipt-text/capacity-rung-values';
import { renderFromServer, renderOnline } from '@shared/randomizer/receipt-text/receipt-templates';
import { clearSessionDialogue, setSessionReceiptMessages } from '@app/lib/game/session-dialogue/session-dialogue';
import { ARRIVAL_SLOTS } from '@app/lib/game/session-dialogue/arrival-ring';
import { cancelServerDeliveries, deliverServerItem } from '@app/lib/game/randomizer-client/server-delivery';
import { installFakeModule } from './ap-fake-module';
import type { FakeModule } from './ap-fake-module';

const bridge = vi.hoisted(() => ({ mod: null as unknown }));
const queue = vi.hoisted(() => ({
  entries: [] as { messageOf: () => number | undefined; onComplete?: () => void; onGranted?: () => void }[],
  warnings: [] as string[],
}));

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  const randomizer = (line: string, level?: string): void => { if (level === 'warn') queue.warnings.push(line); };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/lib/game/wasm-bridge', () => ({ getModule: () => bridge.mod }));
vi.mock('@app/lib/game/randomizer-client/online-items', () => ({ resolveServerItemLocalId: () => 0x0b }));
vi.mock('@app/lib/game/delivery-api', () => ({
  deliverItem: (
    _id: number, _label: string, _source: string, messageId?: number | (() => number), onComplete?: () => void,
    onGranted?: () => void,
  ) => {
    const messageOf = typeof messageId === 'function' ? messageId : () => messageId;
    queue.entries.push({ messageOf, onComplete, onGranted });
    return `dlv_${queue.entries.length}`;
  },
}));
vi.mock('@app/lib/game/delivery-queue', () => ({ remove: () => true }));
vi.mock('@app/lib/game/session-dialogue/active-dialogue', () => ({
  readActiveDialogue: () => ({
    code: 'us',
    dictPacked: packPackedBytes([new Uint8Array([1])]),
    lineChunks: Array.from({ length: RANDOMIZER_MSG_BASE + 64 }, () => new Uint8Array([0x7f])),
    fontWidths: new Uint8Array(256).fill(6),
  }),
}));

const SESSION_FILE = '/session_dialogue.bin';
const BURST = 200;
const WALLET = progressiveCapacityItemName('wallet');
const WALLET_STEP = renderCapacityStep('wallet', 0, 1, 100);

let fake: FakeModule;

const chunkAt = (id: number): Uint8Array | undefined => {
  const blob = fake.files.get(SESSION_FILE);
  return blob === undefined ? undefined : unpackPackedBytes(unpackPackedBytes(blob)[1])[id];
};

/** Item |i| of the burst: every fifth from the server, every seventh a progressive wallet. */
const burstItem = (i: number): { item: string; sender: string | null } => ({
  item: i % 7 === 3 ? WALLET : `Treasure ${i}`,
  sender: i % 5 === 0 ? null : `Player ${i % 3}`,
});

const lineOf = ({ item, sender }: { item: string; sender: string | null }): string =>
  (sender === null ? renderFromServer(item) : renderOnline(sender, item));

beforeEach(() => {
  fake = installFakeModule((mod) => { bridge.mod = mod; });
  queue.entries.length = 0;
  queue.warnings.length = 0;
});

afterEach(() => {
  cancelServerDeliveries();
  clearSessionDialogue();
  fake.remove();
});

it('gives each of 200 items received at once its own line at delivery time', () => {
  const planned = ['Bow at Link\'s House. 0 of 2 found.', WALLET_STEP];
  const plannedIds = setSessionReceiptMessages(planned) as number[];
  const detailPage = chunkAt(plannedIds[1]);
  const items = Array.from({ length: BURST }, (_, i) => burstItem(i));
  for (const { item, sender } of items) expect(deliverServerItem(item, sender, () => undefined)).toBe('delivered');
  expect(queue.entries).toHaveLength(BURST);

  const shown: (Uint8Array | undefined)[] = [];
  const held = new Set<number>();
  for (const entry of queue.entries) {
    const id = entry.messageOf() as number;
    expect(id).not.toBe(RANDOMIZER_RECEIPT_MSG.online);
    expect(entry.messageOf()).toBe(id);
    held.add(id);
    shown.push(chunkAt(id));
    // A progressive item's detail page keeps its id and bytes through the burst.
    expect(chunkAt(plannedIds[1])).toEqual(detailPage);
    entry.onGranted?.();
    entry.onComplete?.();
  }
  expect(held.size).toBeLessThanOrEqual(ARRIVAL_SLOTS);
  expect(queue.warnings).toEqual([]);

  // The same lines composed as planned lines: byte for byte what each receipt showed.
  const reference = setSessionReceiptMessages([...planned, ...items.map(lineOf)]) as number[];
  items.forEach((_, i) => expect(shown[i]).toEqual(chunkAt(reference[planned.length + i])));
  expect(new Set(shown.map((chunk) => chunk?.join(','))).size).toBe(new Set(items.map(lineOf)).size);
});
