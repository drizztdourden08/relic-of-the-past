/* @layer shared-asset-extraction @kind types */
import type { GbaRomReader } from '../rom/gba-rom';
import type { RomData } from '../rom/rom-types';
import type { AssetSourceId } from './source-ids';

interface AlttpAssetSources {
  snes: RomData;
  gbaAlttp?: GbaRomReader;
}

type SourceOutcome =
  | { id: AssetSourceId; ok: true; container: Buffer }
  | { id: AssetSourceId; ok: false; reason: string };

interface OptionalSource {
  id: AssetSourceId;
  compile: (sources: AlttpAssetSources) => Buffer | null;
}

interface CompiledAlttpAssetSet {
  base: Buffer;
  supplements: SourceOutcome[];
}

export type { AlttpAssetSources, CompiledAlttpAssetSet, OptionalSource, SourceOutcome };
