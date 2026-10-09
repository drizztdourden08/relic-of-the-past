/* @layer renderer-hud @kind types */
import type { RefObject } from 'react';
import type { HudCountdownSource } from '@shared/hud/data';
import type { PlacedNode } from '@shared/hud/engine';
import type { Rect, Size } from '@shared/hud/layouts';
import type { ModernBindings, SlotAssignment, SlotIndex } from '@rotp/game-data';
import type { HudCountdownContent, HudVitalsContent } from '../../compounds/HudNodeRenderer';

interface HudLayoutViewProps {
  showAllChips?: boolean;
  slideTransform?: string;
  slideTransition?: string;
}

interface CountdownContent {
  countdown: HudCountdownContent;
  source: HudCountdownSource;
}

interface HudViewport {
  containerRef: RefObject<HTMLDivElement | null>;
  scale: number;
  view: Size;
}

interface PlacedLayout {
  all: readonly PlacedNode[];
  buttons: readonly PlacedNode[];
  rest: readonly PlacedNode[];
  bounds: Rect | null;
}

interface ControlSchemeSlice {
  bindings: ModernBindings | null;
  assignments: Record<SlotIndex, SlotAssignment>;
}

interface VitalsContent {
  vitals: HudVitalsContent;
  hearts: number;
  spritesBase: string;
}

export type { ControlSchemeSlice, CountdownContent, HudLayoutViewProps, HudViewport, PlacedLayout, VitalsContent };
