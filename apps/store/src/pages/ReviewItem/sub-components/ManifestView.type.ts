/* @layer store-site @kind types */
import type { PackSource } from '@domains/packs/pack-source.type';

type ManifestViewProps = {
  source: PackSource | null;
  reason: string | null;
};

export type { ManifestViewProps };
