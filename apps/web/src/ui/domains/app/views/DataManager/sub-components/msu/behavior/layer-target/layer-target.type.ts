/* @layer renderer-components @kind types */
import type { MsuLayer, MsuPackManifest } from '@shared/types/msu-manifest';

interface LayerTarget {
  previewKey: string;
  label: string;
  read: (manifest: MsuPackManifest) => MsuLayer[];
  write: (base: MsuPackManifest, layers: MsuLayer[]) => MsuPackManifest;
  oneShot: boolean;
}

export type { LayerTarget };
