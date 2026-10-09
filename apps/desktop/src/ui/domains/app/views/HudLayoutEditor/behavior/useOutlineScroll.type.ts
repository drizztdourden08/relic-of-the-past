/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { HudLayout } from '@rotp/hud';

interface UseOutlineScrollInput {
  doc: HudLayout;
  selectedId: string | null;
  rowElements: RefObject<Map<string, HTMLElement>>;
  expandNodeIds: (ids: readonly string[]) => void;
}

interface OutlineScroll {
  markSelf: (id: string) => void;
}

export type { OutlineScroll, UseOutlineScrollInput };
