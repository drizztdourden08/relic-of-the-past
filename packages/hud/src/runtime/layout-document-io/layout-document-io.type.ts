/* @layer renderer-lib @kind types */
import type { HudLayout } from '../../types';

interface StoredLayouts {
  documents: HudLayout[];
  problems: { id: string; errors: string[] }[];
}

export type { StoredLayouts };
