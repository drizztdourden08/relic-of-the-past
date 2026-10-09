/* @layer renderer-components @kind types */
import type { PlacedNode } from '@shared/hud/engine';

interface StageSelectionProps {
  nodes: readonly PlacedNode[];
  scale: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export type { StageSelectionProps };
