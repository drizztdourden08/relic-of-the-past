/* @layer renderer-components @kind types */
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { DropZone } from '../behavior/drop-intent';

interface OutlineRowProps {
  id: string;
  label: string;
  depth: number;
  kind: 'container' | 'element';
  cell?: string;
  locked?: string;
  isScreen?: boolean;
  hasChildren: boolean;
  collapsed: boolean;
  selected: boolean;
  dragging: boolean;
  dropZone: DropZone | null;
  missingSlots: readonly number[];
  rowRef?: (element: HTMLElement | null) => void;
  onSelect: () => void;
  onToggleCollapse: () => void;
  onRemove: () => void;
  onDragPointerDown?: (event: ReactPointerEvent) => void;
  springing?: boolean;
  shaking?: boolean;
  onRowKeyDown?: (event: ReactKeyboardEvent) => void;
  onOpenMenu?: () => void;
}

export type { OutlineRowProps };
