/* @layer shared-asset-extraction @kind constants */
import { GBA_ALTTP_ASSET_MANIFEST } from './asset-manifest';

const GBA_ALTTP_ASSET_INDEX: Readonly<Record<string, number>> = Object.fromEntries(
  GBA_ALTTP_ASSET_MANIFEST.map((entry, index) => [entry.name, index]),
);

export { GBA_ALTTP_ASSET_INDEX };
