/* @layer renderer-components @kind types */
import type { HudLayout } from '@rotp/hud';

interface SpringLoadInput {
  doc: HudLayout;
  active: boolean;
  rowId: string | null;
}

interface SpringLoad {
  pending: string | null;
  landed: (parentId: string | null) => void;
}

export type { SpringLoad, SpringLoadInput };
