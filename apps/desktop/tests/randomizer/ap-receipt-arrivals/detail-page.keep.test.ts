/* @layer tests @kind test */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { packPackedBytes, RANDOMIZER_MSG_BASE, kLanguages } from '@rotp/asset-extraction';
import { dialogueCharsetOf, progressiveCapacityItemName } from '@rotp/game-data';
import { renderCapacityStep, renderFromServer, renderOnline, renderReceiptMessage } from '@rotp/randomizer';
import { stripHighlight } from '@rotp/game-core';
import {
  clearSessionDialogue, prepareLine, setSessionReceiptMessages,
} from '@app/game/session-dialogue/session-dialogue';
import { cancelServerDeliveries } from '@app/game/randomizer-client/server-delivery';
import type { ReceiptLine } from '@rotp/game-core';
import { installFakeModule } from '../ap-fake-module';
import type { FakeModule } from '../ap-fake-module';
import { plannedLines as planned } from './planned-lines';
import { sessionChunks } from './session-chunks';
import { required } from '../../required';
import type { DeliverItemParams } from '@app/game/delivery-api';

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
  deliverItem: ({ messageId, onComplete, onGranted }: DeliverItemParams) => {
    if (!queue.ready) return null;
    const id = `dlv_${queue.entries.length}`;
    const messageOf = typeof messageId === 'function' ? messageId : () => messageId;
    queue.entries.push({ id, messageOf, onComplete, onGranted });
    return id;
  },
}));
vi.mock('@app/game/delivery-queue', () => ({
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

const US = required(kLanguages.us, 'US language');
const CHARSET = dialogueCharsetOf(US.alphabet, new Uint8Array(US.alphabet.length).fill(6), []);
const WAITKEY = '[Waitkey]';
const ROW_BREAK_RE = /\[(?:2|3|Scroll)\]/;

const joined = (first: ReceiptLine, detail?: ReceiptLine): string =>
  `${prepareLine(first, CHARSET)}${detail === undefined ? '' : prepareLine(detail, CHARSET)}`;

const pagesOf = (message: string): string[][] =>
  message.split(WAITKEY).map((page, index) => page.split(ROW_BREAK_RE).slice(index === 0 ? 0 : 1));

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
    expect(sessionChunks(fake)[required(ids[2], 'detail line id')]?.length).toBeGreaterThan(0);
  });
});
