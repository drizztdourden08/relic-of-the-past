/* @layer shared-storage @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { AssetSourceId } from '@rotp/asset-extraction';

type RomKind = 'snes-alttp' | 'gba-alttp';

interface RomKindSpec {
  kind: RomKind;
  label: Message;
  pattern: RegExp;
  pickExtensions: readonly string[];
  maxBytes: number;
  sha1: readonly string[];
  acceptUnknown: boolean;
  role: 'base' | 'supplement';
  sourceId?: AssetSourceId;
}

export type { RomKind, RomKindSpec };
