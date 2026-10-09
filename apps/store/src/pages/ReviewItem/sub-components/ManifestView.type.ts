/* @layer store-site @kind types */
import type { PackSource } from '@rotp/design/packs';

type ManifestViewProps = {
  source: PackSource | null;
  reason: string | null;
};

export type { ManifestViewProps };
