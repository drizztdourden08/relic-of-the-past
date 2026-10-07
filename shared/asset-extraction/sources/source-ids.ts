/* @layer shared-asset-extraction @kind data */
/**
 * The optional source ids, and nothing else.
 *
 * Deliberately a leaf module with no imports: the storage layer needs to know which
 * sidecar files can exist, and importing that from the source registry would drag the
 * whole extraction pipeline into every renderer module that touches asset storage.
 *
 * Append only. The engine reads containers positionally, so this order is on-disk contract.
 */
const SUPPLEMENT_IDS = ['gba-alttp'] as const;

type AssetSourceId = (typeof SUPPLEMENT_IDS)[number];

export { SUPPLEMENT_IDS };
export type { AssetSourceId };
