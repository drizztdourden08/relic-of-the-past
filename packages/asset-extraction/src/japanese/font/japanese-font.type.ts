/* @layer shared-asset-extraction @kind types */
interface GlyphRun {
  readonly bytes: Uint8Array;
  readonly next: number;
}

interface JapaneseFont {
  readonly glyphCount: number;
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8Array;
  readonly sheet: Uint8Array;
  readonly widths: Uint8Array;
}

export type { GlyphRun, JapaneseFont };
