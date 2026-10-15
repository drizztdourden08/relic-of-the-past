/* @layer renderer-lib @kind types */
import type { AssetSourceId } from '@rotp/asset-extraction';
import type { SetBakeInput } from '@rotp/languages';

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
}

type ExtractResult = { success: boolean; error?: string; failures?: AssetFailure[] };

export type { AssetsResult, BakeInputs, ExtractResult, SupplementRoms };
