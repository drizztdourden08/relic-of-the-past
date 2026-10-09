/* @layer shared-storage @kind types */
import type { MsuPackManifest } from '@rotp/game-data';
import type { ArchiveEntry } from '@shared/storage/archive';

interface MsulPack {
  manifest: MsuPackManifest;
  files: ArchiveEntry[];
}

export type { MsulPack };
