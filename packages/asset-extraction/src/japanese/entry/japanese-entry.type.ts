/* @layer shared-asset-extraction @kind types */
interface JapaneseEntryParams {
  readonly code: string;
  readonly texts: readonly string[];
  readonly fontData: Uint8Array;
  readonly fontWidth: Uint8Array;
}

interface JapanesePackedEntry {
  code: string;
  base: string;
  langData: Buffer;
  fontPacked: Buffer;
  flags: number;
}

interface JapaneseLine {
  readonly id: number;
  readonly content: string;
}

interface ExtractedJapaneseLanguage {
  readonly code: string;
  readonly lines: readonly JapaneseLine[];
  readonly fontData: Uint8Array;
  readonly fontWidth: Uint8Array;
  readonly glyphCount: number;
  readonly lineCount: number;
  readonly flags: number;
}

export type { ExtractedJapaneseLanguage, JapaneseEntryParams, JapanesePackedEntry };
