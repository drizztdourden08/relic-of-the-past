/* @layer shared-game @kind types */
type QuietReceiptKind = 'rupees' | 'bombs' | 'arrows';

interface QuietReceiptSettings {
  quietRupees: boolean;
  quietBombs: boolean;
  quietArrows: boolean;
}

export type { QuietReceiptKind, QuietReceiptSettings };
