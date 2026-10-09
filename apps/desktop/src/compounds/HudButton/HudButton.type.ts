/* @layer renderer-hud @kind types */
import type { HudButtonSpec } from '@rotp/hud';
import type { HudNodeContent } from '../HudNodeRenderer/HudNodeRenderer.type';

interface HudButtonProps {
  spec: HudButtonSpec;
  content: HudNodeContent;
  unassigned: boolean;
  pressed?: boolean;
  held?: boolean;
  scale: number;
  spritesBase: string;
}

interface ButtonInputs { pressed?: boolean; held?: boolean; unassigned?: boolean }

export type { ButtonInputs, HudButtonProps };
