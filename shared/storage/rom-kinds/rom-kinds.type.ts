/* @layer shared-storage @kind types */
import type { AssetSourceId } from '@rotp/asset-extraction';

type RomKind = 'snes-alttp' | 'gba-alttp';

interface RomKindSpec {
  kind: RomKind;
  label: string;
  pattern: RegExp;
  pickExtensions: readonly string[];
  maxBytes: number;
  accepts: readonly string[];
  role: 'base' | 'supplement';
  sourceId?: AssetSourceId;
}

export type { RomKind, RomKindSpec };
