/* @layer shared-game @kind types */
interface ExtraGlyphSlot {
  char: string;
  slot: number;
  width: number;
}

interface DialogueCharset {
  alphabet: readonly string[];
  widths: Uint8Array;
  extras: readonly ExtraGlyphSlot[];
}

export type { DialogueCharset, ExtraGlyphSlot };
