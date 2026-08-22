/* @layer shared-storage @kind data */
/**
 * What kinds of cartridge the app accepts, and how to recognise each one.
 *
 * A base ROM boots the game; a supplement only adds to one. Keeping the kinds explicit
 * replaces the old behaviour of scanning the ROM folder for the first file ending in
 * `.gba`, where any stray or wrong-revision file was silently adopted and then failed
 * deep inside the asset compile.
 */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';

type RomKind = 'snes-alttp' | 'gba-alttp';

interface RomKindSpec {
  kind: RomKind;
  /** Neutral label. The cartridge's own title is data, never a UI literal. */
  label: string;
  /** Matched against a filename to classify it. */
  pattern: RegExp;
  /** Offered by the cross-platform file picker (no leading dots). */
  pickExtensions: readonly string[];
  maxBytes: number;
  /**
   * Accepted SHA-256 digests, checked at import. Empty means "no gate here" — the base
   * cartridge is validated by the extractor's own multi-region SHA-1 profiles instead,
   * so hashing it here would reject the regional ROMs the pipeline already supports.
   */
  accepts: readonly string[];
  role: 'base' | 'supplement';
  /** Which supplement container this kind produces, for a supplement kind. */
  sourceId?: AssetSourceId;
}

const ALTTP_GBA_US_SHA256 = 'f328f8f07d736288a00c80d31cc1630f3aa02aaf20efdcba73d31dae832b5d76';

const ROM_KINDS: Record<RomKind, RomKindSpec> = {
  'snes-alttp': {
    kind: 'snes-alttp',
    label: 'Base cartridge',
    pattern: /\.(sfc|smc)$/i,
    pickExtensions: ['sfc', 'smc', 'zip'],
    maxBytes: 8 * 1024 * 1024,
    accepts: [],
    role: 'base',
  },
  'gba-alttp': {
    kind: 'gba-alttp',
    label: 'Second cartridge',
    pattern: /\.gba$/i,
    pickExtensions: ['gba', 'zip'],
    maxBytes: 32 * 1024 * 1024,
    accepts: [ALTTP_GBA_US_SHA256],
    role: 'supplement',
    sourceId: 'gba-alttp',
  },
};

const ROM_KIND_LIST: RomKindSpec[] = Object.values(ROM_KINDS);

/** The kind a filename belongs to, or null when it is not a ROM we accept. */
const kindOfFile = (fileName: string): RomKind | null =>
  ROM_KIND_LIST.find((spec) => spec.pattern.test(fileName))?.kind ?? null;

const isBaseRom = (fileName: string): boolean => ROM_KINDS['snes-alttp'].pattern.test(fileName);

export { ALTTP_GBA_US_SHA256, ROM_KIND_LIST, ROM_KINDS, isBaseRom, kindOfFile };
export type { RomKind, RomKindSpec };
