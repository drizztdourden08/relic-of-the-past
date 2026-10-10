/* @layer renderer-components @kind types */
import type { DropIntent, DropZone } from '@app/hud-layout-editing/drop-intent';
import type { HudLayout, HudNode } from '@rotp/hud';

interface OutlineRowModel {
  node: HudNode;
  depth: number;
  cell?: string;
  locked?: string;
  isScreen?: boolean;
  hasChildren: boolean;
  collapsed: boolean;
}

interface OutlinePanelProps {
  doc: HudLayout;
  selectedId: string | null;
  slotNumbers: readonly number[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
}

interface DropPreview { rowId: string; zone: DropZone; intent: DropIntent }

export type { DropPreview, OutlinePanelProps, OutlineRowModel };
