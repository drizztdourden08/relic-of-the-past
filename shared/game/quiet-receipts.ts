/* @layer shared-game @kind logic */
/**
 * Quiet receipts: rupees, bombs and arrows the randomizer hands over go straight into the wallet,
 * the bomb bag or the quiver, with no hold-up and no message. One switch per kind, stored with the
 * rest of the profile's settings. It applies to every randomizer delivery, local or online.
 */

type QuietReceiptKind = 'rupees' | 'bombs' | 'arrows';

interface QuietReceiptSettings {
  quietRupees: boolean;
  quietBombs: boolean;
  quietArrows: boolean;
}

const QUIET_RECEIPT_KINDS: readonly QuietReceiptKind[] = ['rupees', 'bombs', 'arrows'];

const QUIET_RECEIPT_KEY: Readonly<Record<QuietReceiptKind, keyof QuietReceiptSettings>> = {
  rupees: 'quietRupees',
  bombs: 'quietBombs',
  arrows: 'quietArrows',
};

const QUIET_RECEIPT_DEFAULTS: QuietReceiptSettings = { quietRupees: false, quietBombs: false, quietArrows: false };

/** Whether |kind| is quiet; a profile that never saved it reads as the default. */
const isQuietReceipt = (settings: Partial<QuietReceiptSettings> | null, kind: QuietReceiptKind): boolean => {
  const key = QUIET_RECEIPT_KEY[kind];
  return settings?.[key] ?? QUIET_RECEIPT_DEFAULTS[key];
};

export { isQuietReceipt, QUIET_RECEIPT_DEFAULTS, QUIET_RECEIPT_KEY, QUIET_RECEIPT_KINDS };
export type { QuietReceiptKind, QuietReceiptSettings };
