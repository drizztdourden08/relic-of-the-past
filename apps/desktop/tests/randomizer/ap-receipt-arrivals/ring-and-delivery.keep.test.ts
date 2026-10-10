/* @layer tests @kind test */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { packPackedBytes, RANDOMIZER_MSG_BASE } from '@rotp/asset-extraction';
import { renderFromServer, renderOnline } from '@rotp/randomizer';
import {
  appendSessionReceiptMessage, clearSessionDialogue, releaseSessionReceiptMessage, setSessionReceiptMessages,
} from '@app/game/session-dialogue/session-dialogue';
import { ARRIVAL_SLOTS } from '@rotp/game-core';
import { cancelServerDeliveries, deliverServerItem } from '@app/game/randomizer-client/server-delivery';
import { installFakeModule } from '../ap-fake-module';
import type { FakeModule } from '../ap-fake-module';
import { plannedLines as planned } from './planned-lines';
import { sessionChunks } from './session-chunks';
import { required } from '../../required';
import type { DeliverItemArgs } from './deliver-item-args.type';

const bridge = vi.hoisted(() => ({ mod: null }));
const queue = vi.hoisted(() => ({
  ready: true,
  entries: [] as { id: string; messageOf: () => number | undefined; onComplete?: () => void; onGranted?: () => void }[],
  removed: [] as string[],
}));

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('../../../../../packages/game-core/src/wasm-bridge', () => ({ getModule: () => bridge.mod, subscribeGameState: () => () => undefined }));
vi.mock('../../../../../packages/randomizer/src/client/online-items', () => ({ resolveServerItemLocalId: () => 0x0b }));
vi.mock('@app/game/delivery-api', () => ({
  deliverItem: (...[, , , messageId, onComplete, onGranted]: DeliverItemArgs) => {
    if (!queue.ready) return null;
    const id = `dlv_${queue.entries.length}`;
    const messageOf = typeof messageId === 'function' ? messageId : () => messageId;
    queue.entries.push({ id, messageOf, onComplete, onGranted });
    return id;
  },
}));
vi.mock('../../../../../packages/randomizer/src/delivery-queue/remove', () => ({
  remove: (id: string) => {
    queue.removed.push(id);
    return true;
  },
}));
vi.mock('../../../../../packages/game-core/src/session-dialogue/active-dialogue', () => ({
  readActiveDialogue: () => ({
    code: 'us',
    dictPacked: packPackedBytes([new Uint8Array([1])]),
    lineChunks: Array.from({ length: RANDOMIZER_MSG_BASE + 64 }, () => new Uint8Array([0x7f])),
    fontWidths: new Uint8Array(256).fill(6),
  }),
}));

let fake: FakeModule;

const chunks = (): Uint8Array[] => sessionChunks(fake);
const chunkAt = (id: number): Uint8Array | undefined => chunks()[id];

beforeEach(() => {
  fake = installFakeModule((mod) => { bridge.mod = mod; });
  queue.ready = true;
  queue.entries.length = 0;
  queue.removed.length = 0;
});

afterEach(() => {
  cancelServerDeliveries();
  clearSessionDialogue();
  fake.remove();
});

describe('a received item\'s receipt line', () => {
  it('sits in the ring in front of the planned lines and survives a refresh of any length', () => {
    const ids = setSessionReceiptMessages(planned(0)) as number[];
    const arrival = appendSessionReceiptMessage('Zelda sent you the Hookshot.') as number;
    expect(arrival).toBe(required(ids[0], 'first planned id') - ARRIVAL_SLOTS);
    const line = chunkAt(arrival);
    expect(setSessionReceiptMessages(planned(1))).toEqual(ids);
    expect(setSessionReceiptMessages(planned(1).slice(0, 1))).toEqual([ids[0]]);
    const longer = setSessionReceiptMessages([...planned(2), 'One line more.']);
    expect(longer).toEqual([...ids, required(ids[1], 'second planned id') + 1]);
    expect(chunkAt(arrival)).toEqual(line);
  });

  it('reuses an id once its delivery completed, and never grows the pool', () => {
    setSessionReceiptMessages(planned(0));
    const size = chunks().length;
    const taken = Array.from({ length: ARRIVAL_SLOTS }, (_, i) => appendSessionReceiptMessage(`Item ${i}.`) as number);
    expect(new Set(taken).size).toBe(ARRIVAL_SLOTS);
    expect(appendSessionReceiptMessage('One too many.')).toBeNull();
    releaseSessionReceiptMessage(required(taken[5], 'sixth arrival id'));
    expect(appendSessionReceiptMessage('The next one.')).toBe(taken[5]);
    for (let i = 0; i < 100; i += 1) {
      const id = appendSessionReceiptMessage(`Round ${i}.`);
      if (id === null) releaseSessionReceiptMessage(required(taken[i % ARRIVAL_SLOTS], 'taken arrival id'));
      else releaseSessionReceiptMessage(id);
    }
    expect(chunks().length).toBe(size);
  });

  it('a session stop drops the arrivals with the pool', () => {
    setSessionReceiptMessages(planned(0));
    const first = appendSessionReceiptMessage('Zelda sent you the Hookshot.');
    clearSessionDialogue();
    setSessionReceiptMessages(planned(0));
    expect(appendSessionReceiptMessage('Zelda sent you the Lamp.')).toBe(first);
  });
});

describe('a server delivery', () => {
  it('grants through onGranted only, frees its line on completion, and withdraws what still waits', () => {
    setSessionReceiptMessages(planned(0));
    const granted: string[] = [];
    expect(deliverServerItem('Hookshot', 'Zelda', () => granted.push('Hookshot'))).toBe('delivered');
    expect(deliverServerItem('Lamp', 'Zelda', () => granted.push('Lamp'))).toBe('delivered');
    const first = required(queue.entries[0], 'first queued delivery');
    const second = required(queue.entries[1], 'second queued delivery');
    expect(granted).toEqual([]);
    const firstId = first.messageOf();
    expect(first.messageOf()).toBe(firstId);
    first.onGranted?.();
    expect(granted).toEqual(['Hookshot']);
    first.onComplete?.();
    for (let i = 1; i < ARRIVAL_SLOTS; i += 1) appendSessionReceiptMessage(`Filler ${i}.`);
    expect(appendSessionReceiptMessage('Reuses the first line.')).toBe(firstId);
    cancelServerDeliveries();
    expect(queue.removed).toEqual([second.id]);
    queue.ready = false;
    expect(deliverServerItem('Bow', 'Zelda', () => granted.push('Bow'))).toBe('not-ready');
    expect(granted).toEqual(['Hookshot']);
  });

  it('gives an item the server itself sent the server line, not a player line', () => {
    setSessionReceiptMessages(planned(0));
    expect(deliverServerItem('Lamp', null, () => undefined)).toBe('delivered');
    const sent = chunkAt(required(queue.entries[0], 'queued delivery').messageOf() as number);
    const serverLine = chunkAt(appendSessionReceiptMessage(renderFromServer('Lamp')) as number);
    const playerLine = chunkAt(appendSessionReceiptMessage(renderOnline('Server', 'Lamp')) as number);
    expect(sent).toEqual(serverLine);
    expect(sent).not.toEqual(playerLine);
  });
});
