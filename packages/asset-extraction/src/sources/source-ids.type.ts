/* @layer shared-asset-extraction @kind types */
import type { SUPPLEMENT_IDS } from './source-ids';

type AssetSourceId = (typeof SUPPLEMENT_IDS)[number];

export type { AssetSourceId };
