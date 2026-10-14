/* @layer tests @kind test */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { packPackedBytes, unpackPackedBytes, RANDOMIZER_MSG_BASE, RANDOMIZER_RECEIPT_MSG } from '@rotp/asset-extraction';
import { progressiveCapacityItemName } from '@rotp/game-data';
import { renderCapacityStep, renderFromServer, renderOnline } from '@rotp/randomizer';
import { clearSessionDialogue, setSessionReceiptMessages } from '@app/game/session-dialogue/session-dialogue';
import { ARRIVAL_SLOTS } from '@rotp/game-core';
import { cancelServerDeliveries, deliverServerItem } from '@app/game/randomizer-client/server-delivery';
import { installFakeModule } from './ap-fake-module';
import type { FakeModule } from './ap-fake-module';
import type { DeliverItemParams } from '@app/game/delivery-api';
import { required } from '../required';

const bridge = vi.hoisted(() => ({ mod: null }));
const queue = vi.hoisted(() => ({
  entries: [] as { messageOf: () => number | undefined; onComplete?: () => void; onGranted?: () => void }[],
  warnings: [] as string[],
}));

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  const randomizer = (line: string, level?: string): void => { if (level === 'warn') queue.warnings.push(line); };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('../../../../packages/game-core/src/wasm-bridge', () => ({ getModule: () => bridge.mod, subscribeGameState: () => () => undefined }));
vi.mock('../../../../packages/randomizer/src/client/online-items', () => ({ resolveServerItemLocalId: () => 0x0b }));
vi.mock('@app/game/delivery-api', () => ({
  deliverItem: ({ messageId, onComplete, onGranted }: DeliverItemParams) => {
    const messageOf = typeof messageId === 'function' ? messageId : () => messageId;
    queue.entries.push({ messageOf, onComplete, onGranted });
    return `dlv_${queue.entries.length}`;
  },
}));
vi.mock('@app/game/delivery-queue', () => ({ remove: () => true }));
vi.mock('../../../../packages/game-core/src/session-dialogue/active-dialogue', () => ({
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
  return blob === undefined ? undefined : unpackPackedBytes(required(unpackPackedBytes(blob)[1], 'session line chunks'))[id];
};

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
  const detailId = required(plannedIds[1], 'detail page id');
  const detailPage = chunkAt(detailId);
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
    expect(chunkAt(detailId)).toEqual(detailPage);
    entry.onGranted?.();
    entry.onComplete?.();
  }
  expect(held.size).toBeLessThanOrEqual(ARRIVAL_SLOTS);
  expect(queue.warnings).toEqual([]);

  const reference = setSessionReceiptMessages([...planned, ...items.map(lineOf)]) as number[];
  items.forEach((_, i) => expect(shown[i]).toEqual(chunkAt(required(reference[planned.length + i], `reference line ${i}`))));
  expect(new Set(shown.map((chunk) => chunk?.join(','))).size).toBe(new Set(items.map(lineOf)).size);
});
