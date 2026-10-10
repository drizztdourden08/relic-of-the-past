/* @layer renderer-components @kind types */
import type { DropIntent } from '@app/hud-layout-editing/drop-intent';
import type { HudContainer } from '@rotp/hud';

interface LayoutSectionProps {
  node: HudContainer;
  onPatch: (patch: Partial<HudContainer>) => void;
  onDrop?: (ids: readonly string[], intent: DropIntent) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { LayoutSectionProps };
