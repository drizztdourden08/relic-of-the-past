/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { DropIntent } from './drop-intent';
import type { HudLayout } from '@rotp/hud';

interface OutlineDragInput {
  doc: HudLayout;
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
  rowsRef: RefObject<HTMLElement | null>;
}

export type { OutlineDragInput };
