/* @layer tests @kind test */
/**
 * Quiet receipts. With a kind's option on, a rupee, bomb or arrow the randomizer delivers (from
 * another player, the server or a local seed's delivery) goes straight in through
 * WasmGrantQuietReceipt, takes no receipt line and completes at once; a placed one is armed with
 * the silent line. With it off, it runs the receipt flow with its own per-source line. Under the
 * retro bow the single arrow is the quiver, never quiet. When the core answers that a queued
 * receipt is no longer quiet, the ordinary receipt runs in its place. The real server delivery,
 * delivery api, queue and gate word run against a recording core.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderFromServer, renderOnline } from '@shared/randomizer/receipt-text/receipt-templates';
import { deliverItem } from '@app/lib/game/delivery-api';
import { clear, deliveryQueue, startProcessing, stopProcessing } from '@app/lib/game/delivery-queue';
import { setQuietReceiptBits } from '@app/lib/game/gate-word-5';
import { setSessionGate } from '@app/lib/game/session-gate-flags';
import { QUIET_RECEIPT_MSG, quietMessageFor } from '@app/lib/game/quiet-receipts';
import { cancelServerDeliveries, deliverServerItem } from '@app/lib/game/randomizer-client/server-delivery';

const RUPEES_20 = 0x36;
const BOMBS_3 = 0x28;
const ARROWS_10 = 0x44;
const SINGLE_ARROW = 0x43;
const BOW = 0x0b;

const ALL_OFF = { rupees: false, bombs: false, arrows: false };
const ALL_ON = { rupees: true, bombs: true, arrows: true };

const core = vi.hoisted(() => ({
  calls: [] as [string, number[]][],
  lines: [] as string[],
  /** What WasmGrantQuietReceipt answers: 1 granted, 2 not quiet. */
  quietStatus: 1,
}));

const LOCAL_ID: Record<string, number> = { 'Rupees (20)': 0x36, 'Bombs (3)': 0x28, 'Arrows (10)': 0x44 };

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/lib/game/wasm-bridge', () => ({
  getGameState: () => ({ status: 'running' }),
  getModule: () => ({
    ccall: (name: string, _ret: unknown, _types: unknown, args: number[] = []) => {
      core.calls.push([name, args]);
      return name === 'WasmGrantQuietReceipt' ? core.quietStatus : 1;
    },
  }),
}));
vi.mock('@app/lib/game/receipt-grants', () => ({ armReceiptGates: () => undefined }));
vi.mock('@app/lib/game/randomizer-client/online-items', () => ({
  resolveServerItemLocalId: (name: string) => LOCAL_ID[name] ?? BOW,
}));
vi.mock('@app/lib/game/session-dialogue', () => ({
  appendSessionReceiptMessage: (line: string) => {
    core.lines.push(line);
    return 900 + core.lines.length;
  },
  releaseSessionReceiptMessage: () => undefined,
}));

/** The queue's frame loop, driven by hand: every queued callback runs once per step. */
const frames: FrameRequestCallback[] = [];
const step = (count: number): void => {
  for (let i = 0; i < count; i += 1) frames.splice(0).forEach((cb) => cb(0));
};

const callsOf = (name: string): number[][] => core.calls.filter(([n]) => n === name).map(([, args]) => args);

beforeEach(() => {
  core.calls.length = 0;
  core.lines.length = 0;
  core.quietStatus = 1;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => { frames.length = 0; });
  startProcessing();
});

afterEach(() => {
  cancelServerDeliveries();
  stopProcessing();
  clear();
  frames.length = 0;
  setQuietReceiptBits(ALL_OFF);
  setSessionGate('retroBow', false);
  vi.unstubAllGlobals();
});

describe('quiet receipts on', () => {
  beforeEach(() => setQuietReceiptBits(ALL_ON));

  it('puts rupees, bombs and arrows from a player or the server in with no line and no hold-up', () => {
    const granted: string[] = [];
    expect(deliverServerItem('Rupees (20)', 'Zelda', () => granted.push('rupees'))).toBe('delivered');
    expect(deliverServerItem('Bombs (3)', null, () => granted.push('bombs'))).toBe('delivered');
    expect(deliverServerItem('Arrows (10)', 'Zelda', () => granted.push('arrows'))).toBe('delivered');
    step(120);
    expect(granted).toEqual(['rupees', 'bombs', 'arrows']);
    expect(callsOf('WasmGrantQuietReceipt')).toEqual([[RUPEES_20], [BOMBS_3], [ARROWS_10]]);
    expect(callsOf('WasmGrantItemWithReceipt')).toEqual([]);
    expect(callsOf('WasmSetNextReceiptMessage')).toEqual([]);
    expect(core.lines).toEqual([]);
    expect(deliveryQueue.getState()).toEqual({ pending: [], delivering: null });
  });

  it('quiets a local seed\'s delivery, never a cheat grant or another item', () => {
    deliverItem(BOMBS_3, 'Bombs (3)', 'randomizer', 5);
    step(40);
    expect(callsOf('WasmGrantQuietReceipt')).toEqual([[BOMBS_3]]);
    deliverItem(RUPEES_20, 'Rupees (20)', 'cheat');
    deliverServerItem('Bow', 'Zelda', () => undefined);
    expect(deliveryQueue.getState().pending.map((entry) => entry.action.type)).toEqual(['give_item', 'give_item']);
  });

  it('arms placed rupees, bombs and arrows with the silent line and leaves other items alone', () => {
    expect(quietMessageFor(RUPEES_20, 5)).toBe(QUIET_RECEIPT_MSG);
    expect(quietMessageFor(BOMBS_3, 5)).toBe(QUIET_RECEIPT_MSG);
    expect(quietMessageFor(ARROWS_10, -1)).toBe(QUIET_RECEIPT_MSG);
    expect(quietMessageFor(BOW, 5)).toBe(5);
  });

  it('never quiets an arrow under the retro bow, where the single arrow is the quiver', () => {
    setSessionGate('retroBow', true);
    expect(quietMessageFor(SINGLE_ARROW, 5)).toBe(5);
    expect(quietMessageFor(ARROWS_10, 5)).toBe(5);
    expect(quietMessageFor(RUPEES_20, 5)).toBe(QUIET_RECEIPT_MSG);
  });

  it('runs the ordinary receipt when the core answers the receipt is not quiet', () => {
    core.quietStatus = 2;
    deliverServerItem('Rupees (20)', 'Zelda', () => undefined);
    step(2);
    expect(callsOf('WasmGrantQuietReceipt')).toEqual([[RUPEES_20]]);
    expect(callsOf('WasmGrantItemWithReceipt')).toEqual([[RUPEES_20]]);
  });

  it('carries each option on its own gate word 5 bit', () => {
    const word = (): number => callsOf('WasmSetGateWord').at(-1)?.[1] ?? 0;
    expect(callsOf('WasmSetGateWord').at(-1)?.[0]).toBe(5);
    expect(word() & (7 << 28)).toBe(7 << 28);
    setQuietReceiptBits({ rupees: false, bombs: true, arrows: false });
    expect(word() & (7 << 28)).toBe(1 << 29);
  });
});

describe('quiet receipts off', () => {
  it('shows each one its own per-source line through the receipt flow', () => {
    deliverServerItem('Rupees (20)', 'Zelda', () => undefined);
    step(2);
    expect(core.lines).toEqual([renderOnline('Zelda', 'Rupees (20)')]);
    expect(callsOf('WasmSetNextReceiptMessage')).toEqual([[901]]);
    expect(callsOf('WasmGrantItemWithReceipt')).toEqual([[RUPEES_20]]);
    expect(callsOf('WasmGrantQuietReceipt')).toEqual([]);
    clear();
    deliverServerItem('Bombs (3)', null, () => undefined);
    step(40);
    expect(core.lines.at(-1)).toBe(renderFromServer('Bombs (3)'));
    expect(quietMessageFor(BOMBS_3, 5)).toBe(5);
  });

  it('quiets only the kinds whose option is on', () => {
    setQuietReceiptBits({ rupees: false, bombs: false, arrows: true });
    expect(quietMessageFor(ARROWS_10, 5)).toBe(QUIET_RECEIPT_MSG);
    expect(quietMessageFor(RUPEES_20, 5)).toBe(5);
    expect(quietMessageFor(BOMBS_3, 5)).toBe(5);
  });
});
