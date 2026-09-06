/* @layer shared-storage @kind types */
/** Storage-level shapes for language sets: list rows, font payload, extraction input. */

/** One row of the set list, holding identity plus the one cheap content metric. */
type LanguageSetSummary = {
  id: string;
  name: string;
  base: string;
  origin: 'rom' | 'custom';
  /** Number of dialogue entries the set currently holds. */
  lineCount: number;
};

/**
 * The font pair a set carries on disk. Kept as `Uint8Array` (the FileStore's
 * own currency) so this module stays host-neutral; the bake step wraps them
 * for its Node-Buffer pipeline.
 */
type SetFontBytes = {
  fontData: Uint8Array;
  fontWidth: Uint8Array;
};

/** Raw result of a ROM extraction, as produced by the extraction worker. */
interface ExtractedPack {
  code: string;
  description: string;
  dialogue: string;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  flags: number;
}

export type { ExtractedPack, LanguageSetSummary, SetFontBytes };
