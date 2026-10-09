/* @layer renderer-components @kind types */
import type { DropIntent } from './drop-intent';
import type { HudLayout, HudNode } from '@shared/types/hud';

interface NodeEdits {
  selectedId: string | null;
  select: (id: string | null) => void;
  targetId: (doc: HudLayout | null) => string | null;
  insert: (node: HudNode) => void;
  remove: (id: string) => void;
  drop: (ids: readonly string[], intent: DropIntent) => void;
  patch: (id: string, patch: Partial<HudNode>) => void;
}

export type { NodeEdits };
