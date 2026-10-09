/* @layer renderer-lib @kind types */
import type { HudLayout } from '@shared/types/hud';

interface StoredLayouts {
  documents: HudLayout[];
  problems: { id: string; errors: string[] }[];
}

export type { StoredLayouts };
