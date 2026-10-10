/* @layer renderer-components @kind types */
import type { RefObject } from 'react';

interface Scrollable { top: number; bottom: number; left: number; right: number }

interface DragAutoScrollInput {
  active: boolean;
  anchor: RefObject<HTMLElement | null>;
}

export type { DragAutoScrollInput, Scrollable };
