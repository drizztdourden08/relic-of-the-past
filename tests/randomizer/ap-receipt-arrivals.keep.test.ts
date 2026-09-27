/* @layer tests @kind test */
/**
 * A received item's receipt line. The line takes a slot of a fixed ring of 32 at the front of
 * the session dialogue when its delivery reaches the front of the queue, and hands it back when
 * the delivery completes (a burst of any size: ap-receipt-burst.keep.test.ts),
 * so a long session never grows the pool and no refresh of the planned lines, of any length,
 * can move an arrival a queued delivery still holds. Runs the real composer against the
 * recording core (ap-fake-module.ts), which adopts each composed blob and answers with its
 * line count, as the core does; the server delivery runs against a recording queue.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { packPackedBytes, unpackPackedBytes } from '@shared/asset-extraction/packed-bytes';
import { RANDOMIZER_MSG_BASE } from '@shared/asset-extraction/text/data/randomizer-templates';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { dialogueCharsetOf } from '@shared/game/dialog/dialogue-charset';
import { progressiveCapacityItemName } from '@shared/game/data/capacity-progressive-item';
import { renderCapacityStep } from '@shared/randomizer/receipt-text/capacity-rung-values';
import { stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';
import { renderFromServer, renderOnline } from '@shared/randomizer/receipt-text/receipt-templates';
import { renderReceiptMessage } from '@shared/randomizer/receipt-text/render-receipt-message';
import {
  appendSessionReceiptMessage, clearSessionDialogue, prepareLine, releaseSessionReceiptMessage, setSessionReceiptMessages,
} from '@app/lib/game/session-dialogue/session-dialogue';
import { ARRIVAL_SLOTS } from '@app/lib/game/session-dialogue/arrival-ring';
import { cancelServerDeliveries, deliverServerItem } from '@app/lib/game/randomizer-client/server-delivery';
import { installFakeModule } from './ap-fake-module';
import type { FakeModule } from './ap-fake-module';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const bridge = vi.hoisted(() => ({ mod: null as unknown }));
const queue = vi.hoisted(() => ({
  ready: true,
  entries: [] as { id: string; messageOf: () => number | undefined; onComplete?: () => void; onGranted?: () => void }[],
  removed: [] as string[],
}));

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/lib/game/wasm-bridge', () => ({ getModule: () => bridge.mod }));
vi.mock('@app/lib/game/randomizer-client/online-items', () => ({ resolveServerItemLocalId: () => 0x0b }));
vi.mock('@app/lib/game/delivery-api', () => ({
  deliverItem: (
    _id: number, _label: string, _source: string, messageId?: number | (() => number), onComplete?: () => void,
    onGranted?: () => void,
  ) => {
    if (!queue.ready) return null;
    const id = `dlv_${queue.entries.length}`;
    // The queue asks a function for its id when the entry reaches the front (delivery-execute.ts).
    const messageOf = typeof messageId === 'function' ? messageId : () => messageId;
    queue.entries.push({ id, messageOf, onComplete, onGranted });
    return id;
  },
}));
vi.mock('@app/lib/game/delivery-queue', () => ({
  remove: (id: string) => {
    queue.removed.push(id);
    return true;
  },
}));
// The baked dialogue needs a real asset blob; a stand-in with every baked line present is
// what the composer builds on, and the session lines are encoded for real.
vi.mock('@app/lib/game/session-dialogue/active-dialogue', () => ({
  readActiveDialogue: () => ({
    code: 'us',
    dictPacked: packPackedBytes([new Uint8Array([1])]),
    lineChunks: Array.from({ length: RANDOMIZER_MSG_BASE + 64 }, () => new Uint8Array([0x7f])),
    fontWidths: new Uint8Array(256).fill(6),
  }),
}));

const SESSION_FILE = '/session_dialogue.bin';

let fake: FakeModule;

/** Every line chunk of the last adopted blob. */
const chunks = (): Uint8Array[] => {
  const blob = fake.files.get(SESSION_FILE);
  return blob === undefined ? [] : unpackPackedBytes(unpackPackedBytes(blob)[1]);
};

const chunkAt = (id: number): Uint8Array | undefined => chunks()[id];

const planned = (found: number): string[] => [
  `Bow at Link's House. ${found} of 2 found.`,
  `Lamp at the Sanctuary. ${found} of 2 found.`,
];

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
    expect(arrival).toBe(ids[0] - ARRIVAL_SLOTS);
    const line = chunkAt(arrival);
    expect(setSessionReceiptMessages(planned(1))).toEqual(ids);
    expect(setSessionReceiptMessages(planned(1).slice(0, 1))).toEqual([ids[0]]);
    const longer = setSessionReceiptMessages([...planned(2), 'One line more.']);
    expect(longer).toEqual([...ids, ids[1] + 1]);
    expect(chunkAt(arrival)).toEqual(line);
  });

  it('reuses an id once its delivery completed, and never grows the pool', () => {
    setSessionReceiptMessages(planned(0));
    const size = chunks().length;
    const taken = Array.from({ length: ARRIVAL_SLOTS }, (_, i) => appendSessionReceiptMessage(`Item ${i}.`) as number);
    expect(new Set(taken).size).toBe(ARRIVAL_SLOTS);
    expect(appendSessionReceiptMessage('One too many.')).toBeNull();
    releaseSessionReceiptMessage(taken[5]);
    expect(appendSessionReceiptMessage('The next one.')).toBe(taken[5]);
    for (let i = 0; i < 100; i += 1) {
      const id = appendSessionReceiptMessage(`Round ${i}.`);
      if (id === null) releaseSessionReceiptMessage(taken[i % ARRIVAL_SLOTS]);
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

const US = kLanguages.us;
const CHARSET = dialogueCharsetOf(US.alphabet, new Uint8Array(US.alphabet.length).fill(6), []);
const WAITKEY = '[Waitkey]';
const ROW_BREAK_RE = /\[(?:2|3|Scroll)\]/;

/** The message as the core shows it: the receipt's own line, then the detail page joined behind it. */
const joined = (first: ReceiptLine, detail?: ReceiptLine): string =>
  `${prepareLine(first, CHARSET)}${detail === undefined ? '' : prepareLine(detail, CHARSET)}`;

/** Each page of a message, as its rows (a page opens on its first row break). */
const pagesOf = (message: string): string[][] =>
  message.split(WAITKEY).map((page, index) => page.split(ROW_BREAK_RE).slice(index === 0 ? 0 : 1));

/** A page read as one sentence, markup and padding rows dropped. */
const readPage = (rows: readonly string[]): string => stripHighlight(rows.filter((row) => row !== '').join(' '));

const WALLET = progressiveCapacityItemName('wallet');
const WALLET_STEP = renderCapacityStep('wallet', 0, 1, 100);
const WALLET_STEP_TEXT = 'Your wallet stretches 1 tier. 0 > 99 rupees. 9999 is the ceiling.';

describe('a receipt with a detail page', () => {
  it('reads the incoming line first and the climb on the next page, from a player and from the server', () => {
    const fromPlayer = pagesOf(joined(renderOnline('Zelda', WALLET), WALLET_STEP));
    expect(fromPlayer.map(readPage)).toEqual(['Zelda turned up your Progressive Wallet over in their world.', WALLET_STEP_TEXT]);
    const fromServer = pagesOf(joined(renderFromServer(WALLET), WALLET_STEP));
    expect(fromServer.map(readPage)).toEqual(['The server sent you Progressive Wallet!', WALLET_STEP_TEXT]);
    for (const rows of fromServer) expect(rows.length).toBeLessThanOrEqual(3);
  });

  it('keeps a server item with no detail line on one page', () => {
    const message = joined(renderFromServer('Moon Pearl'));
    expect(message).not.toMatch(/\[(?:Waitkey|Scroll)\]/);
    expect(pagesOf(message).map(readPage)).toEqual(['The server sent you Moon Pearl!']);
  });

  it('reads the found line first for a local pickup, the climb after it', () => {
    const found = renderReceiptMessage({ kind: 'physical', itemName: WALLET, locationName: "Link's House" });
    const pages = pagesOf(joined(found, WALLET_STEP));
    expect(pages.map(readPage)).toEqual(["Progressive Wallet! Hidden in Link's House all this time.", WALLET_STEP_TEXT]);
  });

  it('gives every family its climb on the page after the same first line', () => {
    const steps: readonly [string, ReceiptLine, string][] = [
      [progressiveCapacityItemName('explosives'), renderCapacityStep('explosives', 1, 2, 8),
        'Your bomb bag swells 1 tier. 10 > 15. 50 is the ceiling.'],
      [progressiveCapacityItemName('projectiles'), renderCapacityStep('projectiles', 1, 3, 8),
        'Your arrows fill out 2 tiers. 30 > 40. 70 is the ceiling.'],
      [progressiveCapacityItemName('meter'), renderCapacityStep('meter', 1, 2, 3),
        'Your magic meter deepens 1 tier. Normal > half. Quarter is the ceiling.'],
    ];
    for (const [item, step, text] of steps) {
      const pages = pagesOf(joined(renderOnline('Zelda', item), step));
      expect(pages.map(readPage)).toEqual([`Zelda turned up your ${item} over in their world.`, text]);
    }
  });

  it('scrolls the whole box at the page break and fits each page in three rows', () => {
    const message = joined(renderOnline('Zelda', WALLET), WALLET_STEP);
    const detail = message.slice(message.indexOf(WAITKEY) + WAITKEY.length);
    expect(detail.match(/\[Scroll\]/g)).toHaveLength(3);
    expect(detail).not.toMatch(/\[(?:2|3)\]/);
    for (const rows of pagesOf(message)) expect(rows.length).toBeLessThanOrEqual(3);
  });

  it('keeps an item with no detail line on one page', () => {
    expect(joined(renderOnline('Zelda', 'Moon Pearl'))).not.toMatch(/\[(?:Waitkey|Scroll)\]/);
    const found = renderReceiptMessage({ kind: 'physical', itemName: 'Lamp', locationName: 'Sanctuary' });
    expect(pagesOf(joined(found))).toHaveLength(1);
  });

  it('composes a detail page into the pool like any other line', () => {
    const ids = setSessionReceiptMessages([...planned(0), WALLET_STEP]) as number[];
    expect(chunkAt(ids[2])?.length).toBeGreaterThan(0);
  });
});

describe('a server delivery', () => {
  it('grants through onGranted only, frees its line on completion, and withdraws what still waits', () => {
    setSessionReceiptMessages(planned(0));
    const granted: string[] = [];
    expect(deliverServerItem('Hookshot', 'Zelda', () => granted.push('Hookshot'))).toBe('delivered');
    expect(deliverServerItem('Lamp', 'Zelda', () => granted.push('Lamp'))).toBe('delivered');
    const [first, second] = queue.entries;
    expect(granted).toEqual([]);
    // The line is taken at the front of the queue, and a retry after a refusal keeps it.
    const firstId = first.messageOf();
    expect(first.messageOf()).toBe(firstId);
    first.onGranted?.();
    expect(granted).toEqual(['Hookshot']);
    first.onComplete?.();
    // The second delivery still waits and holds no slot: every other slot taken, the one the
    // completed delivery held is the one left.
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
    const sent = chunkAt(queue.entries[0].messageOf() as number);
    const serverLine = chunkAt(appendSessionReceiptMessage(renderFromServer('Lamp')) as number);
    const playerLine = chunkAt(appendSessionReceiptMessage(renderOnline('Server', 'Lamp')) as number);
    expect(sent).toEqual(serverLine);
    expect(sent).not.toEqual(playerLine);
  });
});
