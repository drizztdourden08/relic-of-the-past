/* @layer renderer-components @kind types */
import type { HudBoxStyle } from '@rotp/hud';

interface StyleGroupProps {
  style: HudBoxStyle;
  setStyle: (patch: HudBoxStyle) => void;
  open: boolean;
  onToggle: () => void;
  onEnable: (on: boolean, patch: HudBoxStyle) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { StyleGroupProps };
