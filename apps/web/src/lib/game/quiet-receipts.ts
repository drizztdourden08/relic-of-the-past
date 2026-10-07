/* @layer bridge-wasm @kind logic */
/**
 * Quiet receipts (shared/game/quiet-receipts.ts): with a kind's option on, a rupee, bomb or arrow
 * the randomizer delivers goes straight to the wallet, bag or quiver (the quiet_receipt delivery,
 * WasmGrantQuietReceipt), and a placed one is armed with the silent line, so its pickup shows the
 * game's own nothing. Each option rides its own gate word 5 bit, so the bit the core reads and the
 * one read here never disagree. Under the retro bow the single arrow is the quiver itself, never
 * ammunition, so arrows are never quiet there.
 */
import { gateWord5Now, QUIET_RECEIPT_BITS } from './gate-word-5';
import { sessionGateArmed } from './session-gate-flags';
import type { QuietReceiptKind } from '@shared/game/quiet-receipts';

/** The native receipts of each kind (ancilla.c Ancilla_AddRupees, misc.c AncillaAdd_ItemReceipt). */
const RECEIPT_KIND: ReadonlyMap<number, QuietReceiptKind> = new Map([
  ...[0x34, 0x35, 0x36, 0x40, 0x41, 0x46, 0x47].map((id): [number, QuietReceiptKind] => [id, 'rupees']),
  ...[0x27, 0x28, 0x31].map((id): [number, QuietReceiptKind] => [id, 'bombs']),
  ...[0x43, 0x44].map((id): [number, QuietReceiptKind] => [id, 'arrows']),
]);

/** kReceiptMsg_Silent (game_hooks.h): no dialogue line has this id, and the seam shows no text for it. */
const QUIET_RECEIPT_MSG = 0x7fff;

/** Receipt |itemId| is a rupee, bomb or arrow whose option is on. */
const isQuietReceiptItem = (itemId: number): boolean => {
  const kind = RECEIPT_KIND.get(itemId);
  if (kind === undefined) return false;
  if (kind === 'arrows' && sessionGateArmed('retroBow')) return false;
  return (gateWord5Now() & QUIET_RECEIPT_BITS[kind]) !== 0;
};

/** The line a placed grant of |itemId| is armed with: the silent one for a quiet receipt. */
const quietMessageFor = (itemId: number, messageId: number): number =>
  (isQuietReceiptItem(itemId) ? QUIET_RECEIPT_MSG : messageId);

export { isQuietReceiptItem, QUIET_RECEIPT_MSG, quietMessageFor };
