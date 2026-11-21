/* @layer renderer-lib @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { AssetSourceId, ZELDA3_SHA1 } from '@rotp/asset-extraction';
import type { ExtractedPack, SetBakeInput } from '@rotp/languages';

type RomRelease = (typeof ZELDA3_SHA1)[string];

type SupplementRoms = Partial<Record<AssetSourceId, Uint8Array>>;

interface BakeInputs {
  romBytes: Uint8Array;
  supplementRoms: SupplementRoms;
  languages: SetBakeInput[];
}

type AssetFailure = { id: AssetSourceId; reason: string };

interface AssetsResult {
  base: Uint8Array;
  sidecars: { id: AssetSourceId; bytes: Uint8Array }[];
  failures: AssetFailure[];
  romLanguage: ExtractedPack;
}

type ExtractResult = { success: boolean; error?: Text; failures?: AssetFailure[] };

export type {
  AssetsResult, BakeInputs, ExtractResult, RomRelease, SupplementRoms,
};
