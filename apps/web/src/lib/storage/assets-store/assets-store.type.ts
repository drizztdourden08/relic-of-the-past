/* @layer renderer-lib @kind types */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';

interface AssetsResult {
  base: Uint8Array;
  sidecars: { id: AssetSourceId; bytes: Uint8Array }[];
  failures: { id: AssetSourceId; reason: string }[];
}

type ExtractResult = { success: boolean; error?: string; failures?: { id: AssetSourceId; reason: string }[] };

export type { AssetsResult, ExtractResult };
